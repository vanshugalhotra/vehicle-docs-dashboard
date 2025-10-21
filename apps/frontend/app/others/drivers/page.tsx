"use client";

import React, { useState } from "react";
import { FormEmbeddedPanel } from "@/components/crud/Form/FormEmbeddedPanel";
import { DataTable } from "@/components/crud/DataTable/DataTable";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import { toastUtils } from "@/lib/utils/toastUtils";
import { useCRUDController } from "@/hooks/useCRUDController";
import { CRUDPageLayout } from "@/components/crud/CRUDPageLayout";
import { Driver, driverCrudConfig } from "@/lib/crud-configs/driverCrudConfig";
import { PaginationBar } from "@/components/crud/PaginationBar.tsx/PaginationBar";

export default function DriversPage() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const {
    data: drivers,
    isLoading: loading,
    create,
    update,
    remove,
    refetch,
    filters,
    setFilters,
    pageSize,
    setPageSize,
    page,
    setPage,
    total,
  } = useCRUDController<Driver>(driverCrudConfig);

  const resetForm = () => {
    setSelectedDriver(null);
    setFormKey((prev) => prev + 1);
  };

  const handleSubmit = async (values: Driver) => {
    const submitPromise = async (): Promise<void> => {
      if (selectedDriver?.id) {
        await update({ id: selectedDriver.id, data: values });
      } else {
        await create(values);
      }
      resetForm();
      await refetch();
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

  const handleDelete = (driver: Driver) => {
    setDriverToDelete(driver);
  };

  const handleConfirmDelete = async () => {
    if (!driverToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await remove(driverToDelete.id);
      await refetch();
      toastUtils.success("Driver deleted successfully");
    } catch (err: unknown) {
      toastUtils.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
      setDriverToDelete(null);
    }
  };

  return (
    <CRUDPageLayout
      title="Drivers"
      isEditing={!!selectedDriver}
      onCancelEdit={resetForm}
      search={(filters.search as string) ?? ""}
      onSearchChange={(value) => setFilters({ ...filters, search: value })}
      onAdd={resetForm}
      addLabel="Add Driver"
      form={
        <FormEmbeddedPanel
          key={formKey}
          title={selectedDriver ? "Edit Driver" : "Add Driver"}
          fields={driverCrudConfig.fields}
          schema={driverCrudConfig.schema}
          selectedRecord={selectedDriver}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          loading={loading}
          layout="stacked"
        />
      }
      table={
        <div className="flex flex-col gap-4">
          <DataTable
            columns={driverCrudConfig.columns}
            data={drivers}
            loading={loading}
            onEdit={(row) => setSelectedDriver(row)}
            onDelete={handleDelete}
          />
          <PaginationBar
            page={page}
            pageSize={pageSize}
            totalCount={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      }
      footer={
        <ConfirmDialog
          open={!!driverToDelete}
          title="Delete Driver?"
          description={`Are you sure you want to delete ${driverToDelete?.name}?`}
          loading={deleteLoading}
          onCancel={() => setDriverToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      }
    />
  );
}
