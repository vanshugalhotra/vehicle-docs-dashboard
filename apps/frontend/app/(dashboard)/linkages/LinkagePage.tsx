"use client";

import React, { useState } from "react";
import { EntityViewPage } from "@/components/crud/EntityViewPage";
import { useCRUDController } from "@/hooks/useCRUDController";
import {
  linkageCrudConfig,
  LinkageEntity,
  renewalSchema,
} from "@/configs/crud/linkage.config";
import { toastUtils } from "@/lib/utils/toastUtils";
import { useRouter } from "next/navigation";
import FormModal from "@/components/crud/Form/FormModal";

export default function LinkagePage() {
  const router = useRouter();

  const controller = useCRUDController<LinkageEntity>(linkageCrudConfig);

  // ---------------- Renewal State ----------------
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewItem, setRenewItem] = useState<LinkageEntity | null>(null);

  const renewFields = linkageCrudConfig.fields.filter((field) =>
    ["documentNo", "startDate", "expiryDate"].includes(field.key as string)
  );

  const handleRenew = (item: LinkageEntity) => {
    setRenewItem(item);
    setRenewOpen(true);
  };

  const handleRenewSubmit = async (values: Partial<LinkageEntity>) => {
    if (!renewItem?.id) return;

    const payload = {
      documentNo: values.documentNo,
      startDate: values.startDate,
      expiryDate: values.expiryDate,
    };

    toastUtils.promise(controller.update({ id: renewItem.id, data: payload }), {
      loading: "Renewing document...",
      success: "Document renewed successfully!",
      error: (err) =>
        err instanceof Error ? err.message : "Failed to renew document",
    });

    setRenewOpen(false);
    setRenewItem(null);
    await controller.refetch();
  };

  // ---------------- Delete ----------------
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
    <>
      <EntityViewPage<LinkageEntity>
        title="Linkages"
        columns={linkageCrudConfig.columns(
          controller.page,
          controller.pageSize
        )}
        data={controller.data}
        loading={controller.isLoading}
        filtersConfig={linkageCrudConfig.filters}
        filters={controller.filters}
        onFiltersChange={controller.setFilters}
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
        onRenew={handleRenew}
        exportTable={linkageCrudConfig.exportTable}
        deleteDescription={(item) =>
          `Are you sure you want to delete the document "${item.documentNo}" linked to vehicle "${item.vehicleName}"?`
        }
      />

      {/* Renew Form Modal */}
      <FormModal<LinkageEntity>
        title="Renew Document"
        fields={renewFields}
        open={renewOpen}
        defaultValues={{
          documentNo: renewItem?.documentNo,
          startDate: renewItem?.startDate,
          expiryDate: renewItem?.expiryDate,
        }}
        onClose={() => {
          setRenewOpen(false);
          setRenewItem(null);
        }}
        schema={renewalSchema}
        onSubmit={handleRenewSubmit}
        loading={controller.isLoading}
      />
    </>
  );
}
