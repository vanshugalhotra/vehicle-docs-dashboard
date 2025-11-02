"use client";

import React, { useState, useMemo, useEffect } from "react";
import { HeaderBar } from "@/components/crud/HeaderBar/HeaderBar";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { DataTable } from "@/components/crud/DataTable/DataTable";
import VehicleSelector from "./VehicleSelector";
import DocumentTypeSelector from "./DocumentTypeSelector";
import { useCRUDController } from "@/hooks/useCRUDController";
import { useFormStateController } from "@/hooks/useFormStateController";
import { VehicleResponse } from "@/lib/types/vehicle.types";
import { FiltersObject } from "@/lib/types/filter.types";
import {
  linkageCrudConfig,
  LinkageEntity,
} from "@/configs/crud/linkage.config";
import { AppBadge } from "@/components/ui/AppBadge";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import { toastUtils } from "@/lib/utils/toastUtils";
import { PaginationBar } from "@/components/crud/PaginationBar.tsx/PaginationBar";
import { Search } from "lucide-react";

export default function LinkagePage() {
  // -------------------------------
  // 🔹 Selected Vehicle
  // -------------------------------
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleResponse | null>(null);

  // -------------------------------
  // 🔹 Filters (depend on vehicle)
  // -------------------------------
  const filters: FiltersObject = useMemo(
    () => (selectedVehicle ? { vehicleId: selectedVehicle.id } : {}),
    [selectedVehicle]
  );

  // -------------------------------
  // 🔹 CRUD Controller
  // -------------------------------
  const crud = useCRUDController<LinkageEntity>({
    ...linkageCrudConfig,
    defaultFilters: filters,
  });

  const {
    data,
    isLoading,
    remove,
    refetch,
    setFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
  } = crud;

  // -------------------------------
  // 🔹 Form Controller
  // -------------------------------
  const form = useFormStateController<LinkageEntity>("modal");

  // -------------------------------
  // 🔹 Deletion State
  // -------------------------------
  const [itemToDelete, setItemToDelete] = useState<LinkageEntity | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = (record: LinkageEntity) => setItemToDelete(record);

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await remove(itemToDelete.id);
      await refetch();
      toastUtils.success("Document linkage deleted successfully");
    } catch (err) {
      toastUtils.error(
        err instanceof Error ? err.message : "Failed to delete document linkage"
      );
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
    }
  };

  // -------------------------------
  // 🔹 Watch vehicle change → update filters
  // -------------------------------
  useEffect(() => {
    if (selectedVehicle) {
      setFilters({ vehicleId: selectedVehicle.id });
      refetch();
    } else {
      setFilters({});
    }
  }, [selectedVehicle, setFilters, refetch]);

  // -------------------------------
  // 🔹 Render
  // -------------------------------
  return (
    <div className="flex flex-col space-y-6">
      <HeaderBar title="Link Vehicle Documents" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Vehicle Selector */}
        <div className="lg:col-span-2 flex flex-col space-y-4 h-full">
          <AppCard
            bordered
            hoverable
            padded
            className="flex-1 flex flex-col min-h-[300px]"
          >
            <VehicleSelector onSelect={setSelectedVehicle} />
          </AppCard>
        </div>

        {/* Document Type Selector */}
        <div className="flex flex-col space-y-4 h-full">
          <AppCard
            bordered
            hoverable
            padded
            className="flex-1 flex flex-col min-h-[300px]"
          >
            <DocumentTypeSelector />
          </AppCard>
        </div>
      </div>

      {/* Linked Documents Table */}
      {selectedVehicle ? (
        <AppCard bordered hoverable padded className="m-0">
          <AppText size="heading3" className="mb-3">
            Linked Documents{" "}
            <AppBadge variant="info" className="ml-4 text-xl!">
              {selectedVehicle.name}
            </AppBadge>
          </AppText>

          <div className="flex flex-col gap-4">
            <DataTable<LinkageEntity>
              columns={linkageCrudConfig.columns}
              data={data}
              loading={isLoading}
              onEdit={(row: LinkageEntity) => form.openEdit(row)}
              onDelete={handleDelete}
              className="mt-4"
            />

            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalCount={total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </AppCard>
      ) : (
        <AppCard bordered>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-primary-light/80 p-2 rounded-full mb-3">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <AppText size="heading3" variant="primary">
              Please select a vehicle
            </AppText>
            <AppText size="body" variant="secondary">
              to view linked documents.
            </AppText>
          </div>
        </AppCard>
      )}

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        open={!!itemToDelete}
        title="Delete Linked Document?"
        description={`Are you sure you want to delete this document linkage${
          itemToDelete?.documentNo ? ` (No: ${itemToDelete.documentNo})` : ""
        }?`}
        loading={deleteLoading}
        onCancel={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
