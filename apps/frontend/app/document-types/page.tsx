"use client";

import React, { useState } from "react";
import { EntityViewPage } from "@/components/crud/EntityViewPage";
import { useCRUDController } from "@/hooks/useCRUDController";
import {
  DocumentType,
  documentTypeCrudConfig,
} from "@/configs/crud/document-types.config";
import { toastUtils } from "@/lib/utils/toastUtils";
import { useRouter } from "next/navigation";

export default function DocumentTypesPage() {
  const controller = useCRUDController<DocumentType>(documentTypeCrudConfig);
  const router = useRouter();

  const [itemToDelete, setItemToDelete] = useState<DocumentType | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return;
    setDeleteLoading(true);

    try {
      await controller.remove(itemToDelete.id);
      await controller.refetch();
      toastUtils.success("Document type deleted successfully");
    } catch {
      toastUtils.error("Failed to delete document type");
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
    }
  };

  return (
    <EntityViewPage<DocumentType>
      title="Document Types"
      columns={documentTypeCrudConfig.columns}
      data={controller.data}
      loading={controller.isLoading}
      
      /* ---- Filters ---- */
      filtersConfig={documentTypeCrudConfig.filters}
      filters={controller.filters}
      onFiltersChange={controller.setFilters}

      /* ---- Sort ---- */
      sortOptions={documentTypeCrudConfig.sortOptions}
      sort={controller.sort}
      onSortChange={controller.setSort}

      /* ---- Search ---- */
      search={(controller.filters.search as string) ?? ""}
      onSearchChange={(val) =>
        controller.setFilters((prev) => ({ ...prev, search: val }))
      }

      /* ---- Add / Export ---- */
      onAdd={() => router.push("/document-types/add")}
      onExport={() => console.log("Export Document Types clicked")}

      /* ---- Pagination ---- */
      page={controller.page}
      pageSize={controller.pageSize}
      totalCount={controller.total}
      onPageChange={controller.setPage}
      onPageSizeChange={controller.setPageSize}

      /* ---- Delete flow ---- */
      handleDelete={(item) => setItemToDelete(item)}
      confirmDelete={handleConfirmDelete}
      deleteLoading={deleteLoading}
      itemToDelete={itemToDelete}
      onCancelDelete={() => setItemToDelete(null)}

      /* ---- Edit / View placeholders ---- */
      onEdit={() => {}}
      onView={() => {}}
    />
  );
}
