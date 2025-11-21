"use client";

import React, { useState } from "react";
import { EntityViewPage } from "@/components/crud/EntityViewPage";
import { useCRUDController } from "@/hooks/useCRUDController";
import {
  linkageCrudConfig,
  LinkageEntity,
} from "@/configs/crud/linkage.config";
import { toastUtils } from "@/lib/utils/toastUtils";
import { useRouter, useSearchParams } from "next/navigation";

export default function LinkagePage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const initialBusinessFilters = searchParams.has("businessFilters")
    ? JSON.parse(searchParams.get("businessFilters")!)
    : {};

  const controller = useCRUDController<LinkageEntity>({
    ...linkageCrudConfig,
    defaultBusinessFilters: initialBusinessFilters,
  });

  const [itemToDelete, setItemToDelete] = useState<LinkageEntity | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await controller.remove(itemToDelete.id);
      await controller.refetch();
      toastUtils.success("Document linkage deleted successfully");
    } catch (err) {
      toastUtils.error(
        err instanceof Error ? err.message : "Failed to delete linkage"
      );
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
    }
  };

  return (
    <EntityViewPage<LinkageEntity>
      title="Linkages"
      columns={linkageCrudConfig.columns(controller.page, controller.pageSize)}
      data={controller.data}
      loading={controller.isLoading}
      filtersConfig={linkageCrudConfig.filters}
      filters={controller.filters}
      onFiltersChange={controller.setFilters}
      businessFiltersConfig={linkageCrudConfig.businessFilters}
      businessFilters={controller.businessFilters}
      onBusinessFiltersChange={controller.setBusinessFilters}
      sortOptions={linkageCrudConfig.sortOptions}
      sort={controller.sort}
      onSortChange={controller.setSort}
      search={controller.filters.search as string}
      onSearchChange={(val) =>
        controller.setFilters((prev) => ({ ...prev, search: val }))
      }
      page={controller.page}
      pageSize={controller.pageSize}
      totalCount={controller.total}
      onPageChange={controller.setPage}
      onPageSizeChange={controller.setPageSize}
      handleDelete={(item) => setItemToDelete(item)}
      confirmDelete={handleConfirmDelete}
      deleteLoading={deleteLoading}
      itemToDelete={itemToDelete}
      onCancelDelete={() => setItemToDelete(null)}
      onAdd={() => router.push("/linkages/add")}
      onEdit={(item) => router.push(`/linkages/add?editId=${item.id}`)}
      onView={() => {}}
      onExport={() => console.log("Export Linkages clicked")}
      deleteDescription={(item) =>
        `Are you sure you want to delete the document "${item.documentNo}" linked to vehicle "${item.vehicleName}"?`
      }
    />
  );
}
