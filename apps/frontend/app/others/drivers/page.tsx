"use client";

import React, { useEffect, useState, useCallback } from "react";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { DataTable } from "@/components/crud/DataTable/DataTable";
import { toastUtils } from "@/lib/toastUtils";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { AppInput } from "@/components/ui/AppInput";
import { componentTokens } from "@/styles/design-system/componentTokens";
import { FormEmbeddedPanel } from "@/components/crud/Form/FormEmbeddedPanel";

const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type Driver = z.infer<typeof driverSchema> & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [search, setSearch] = useState("");

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await fetchWithAuth<Driver[]>(`/api/v1/drivers${query}`);

      if (data) {
        setDrivers(data);
      } else {
        toastUtils.error("Failed to load drivers");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toastUtils.error(error.message || "Network Error!");
      } else {
        toastUtils.error("Network Error!");
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const handleSubmit = async (values: Driver) => {
    const submitPromise = async (): Promise<void> => {
      const method = selectedDriver ? "PATCH" : "POST";
      const url = selectedDriver
        ? `/api/v1/drivers/${selectedDriver.id}`
        : `/api/v1/drivers`;

      const data = await fetchWithAuth<Driver>(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!data) {
        throw new Error("Request failed");
      }

      setSelectedDriver(null);
      await loadDrivers();
    };

    toastUtils.promise(submitPromise(), {
      loading: selectedDriver ? "Updating driver..." : "Adding driver...",
      success: selectedDriver
        ? "Driver updated successfully"
        : "Driver added successfully",
      error: (error: unknown) =>
        error instanceof Error
          ? error.message
          : String(error) || "Operation failed",
    });
  };

  const handleDelete = async (driver: Driver) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    const deletePromise = async (): Promise<void> => {
      const data = await fetchWithAuth(`/api/v1/drivers/${driver.id}`, {
        method: "DELETE",
      });

      if (data === null) {
        throw new Error("Delete failed");
      }

      await loadDrivers();
    };

    toastUtils.promise(deletePromise(), {
      loading: "Deleting driver...",
      success: "Driver deleted successfully",
      error: (error: unknown) =>
        error instanceof Error
          ? error.message
          : String(error) || "Delete failed",
    });
  };

  const fields = [
    {
      key: "name",
      label: "Name",
      type: "text" as const,
      placeholder: "Enter driver name",
      required: true,
    },
    {
      key: "phone",
      label: "Phone",
      type: "text" as const,
      placeholder: "Enter phone number",
      required: true,
    },
    {
      key: "email",
      label: "Email",
      type: "text" as const,
      placeholder: "Enter email address",
    },
  ];

  const columns: ColumnDef<Driver>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => getValue() || "-",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ getValue }) =>
        getValue() ? new Date(getValue() as string).toLocaleDateString() : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AppText size="heading3">Drivers</AppText>
        {selectedDriver && (
          <AppButton variant="ghost" onClick={() => setSelectedDriver(null)}>
            Cancel Edit
          </AppButton>
        )}
      </div>

      {/* Embedded Form */}
      <FormEmbeddedPanel
        title={selectedDriver ? "Edit Driver" : "Add Driver"}
        fields={fields}
        schema={driverSchema}
        selectedRecord={selectedDriver}
        onSubmit={handleSubmit}
        onCancel={() => setSelectedDriver(null)}
        layout="split"
      />

      {/* Search */}
      <div className="flex justify-end">
        <AppInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search drivers..."
          className="w-64"
        />
      </div>

      {/* Table */}
      <AppCard className={componentTokens.card.base}>
        <DataTable
          columns={columns}
          data={drivers}
          loading={loading}
          onEdit={(row) => setSelectedDriver(row)}
          onDelete={handleDelete}
        />
      </AppCard>
    </div>
  );
}
