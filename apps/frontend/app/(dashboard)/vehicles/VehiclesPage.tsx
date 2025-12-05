"use client";

import React, { useState } from "react";
import { EntityViewPage } from "@/components/crud/EntityViewPage";
import { useCRUDController } from "@/hooks/useCRUDController";
import { vehicleCrudConfig, Vehicle } from "@/configs/crud/vehicles.config";
import { toastUtils } from "@/lib/utils/toastUtils";
import { useRouter, useSearchParams } from "next/navigation";

export default function VehiclesPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const initialBusinessFilters = searchParams.has("businessFilters")
    ? JSON.parse(searchParams.get("businessFilters")!)
    : {};

  const controller = useCRUDController<Vehicle>({
    ...vehicleCrudConfig,
    defaultBusinessFilters: initialBusinessFilters,
  });

  const [itemToDelete, setItemToDelete] = useState<Vehicle | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await controller.remove(itemToDelete.id);
      await controller.refetch();
      toastUtils.success("Vehicle deleted successfully");
    } catch (err) {
      toastUtils.error(
        err instanceof Error ? err.message : "Failed to delete vehicle"
      );
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
    }
  };

  return (
    <EntityViewPage<Vehicle>
      title="Vehicles"
      columns={vehicleCrudConfig.columns(controller.page, controller.pageSize)}
      data={controller.data}
      loading={controller.isLoading}
      filtersConfig={vehicleCrudConfig.filters}
      filters={controller.filters}
      onFiltersChange={controller.setFilters}
      businessFiltersConfig={vehicleCrudConfig.businessFilters}
      businessFilters={controller.businessFilters}
      onBusinessFiltersChange={controller.setBusinessFilters}
      sortOptions={vehicleCrudConfig.sortOptions}
      sort={controller.sort}
      onSortChange={controller.setSort}
      search={controller.filters.search as string}
      onSearchChange={(val) =>
        controller.setFilters((prev) => ({ ...prev, search: val }))
      }
      onAdd={() => router.push("/vehicles/add")}
      exportTable={vehicleCrudConfig.exportTable}
      page={controller.page}
      pageSize={controller.pageSize}
      totalCount={controller.total}
      onPageChange={controller.setPage}
      onPageSizeChange={controller.setPageSize}
      // --- delete flow ---
      handleDelete={(item) => setItemToDelete(item)}
      confirmDelete={handleConfirmDelete}
      deleteLoading={deleteLoading}
      itemToDelete={itemToDelete}
      onCancelDelete={() => setItemToDelete(null)}
      onEdit={(item) => router.push(`/vehicles/add?editId=${item.id}`)}
      onView={() => {}}
      deleteDescription={(item) =>
        `Are you sure you want to delete this vehicle "${item.name}"?`
      }
    />
  );
}
