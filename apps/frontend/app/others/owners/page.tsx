"use client";

import React, { useState } from "react";
import { FormEmbeddedPanel } from "@/components/crud/Form/FormEmbeddedPanel";
import { DataTable } from "@/components/crud/DataTable/DataTable";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import { toastUtils } from "@/lib/utils/toastUtils";
import { useCRUDController } from "@/hooks/useCRUDController";
import { CRUDPageLayout } from "@/components/crud/CRUDPageLayout";
import { PaginationBar } from "@/components/crud/PaginationBar.tsx/PaginationBar";
import { useFormStateController } from "@/hooks/useFormStateController";
import { Owner, ownerCrudConfig } from "@/configs/crud/owners.config";

export default function OwnersPage() {
  const formCtrl = useFormStateController<Owner>("embedded");
  const [ownerToDelete, setOwnerToDelete] = useState<Owner | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleCancel = () => {
    formCtrl.closeForm();
    setFormKey((k) => k + 1);
  };

  const {
    data: owners,
    isLoading,
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
  } = useCRUDController<Owner>(ownerCrudConfig);

  const handleSubmit = async (values: Owner) => {
    const action =
      formCtrl.isEditing && formCtrl.selectedItem?.id
        ? update({ id: formCtrl.selectedItem.id, data: values })
        : create(values);

    toastUtils.promise(action, {
      loading: formCtrl.isEditing ? "Updating owner..." : "Adding owner...",
      success: formCtrl.isEditing
        ? "Owner updated successfully"
        : "Owner added successfully",
      error: (err) =>
        (err instanceof Error && err.message) ||
        (typeof err === "string" ? err : "Operation failed"),
    });

    setFormKey((k) => k + 1);
    formCtrl.closeForm();
    await refetch();
  };

  const handleDelete = (owner: Owner) => setOwnerToDelete(owner);

  const handleConfirmDelete = async () => {
    if (!ownerToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await remove(ownerToDelete.id);
      await refetch();
      toastUtils.success("Owner deleted successfully");
    } catch (err) {
      toastUtils.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
      setOwnerToDelete(null);
    }
  };

  return (
    <CRUDPageLayout
      title="Owners"
      isEditing={formCtrl.isEditing}
      onCancelEdit={formCtrl.closeForm}
      search={(filters.search as string) ?? ""}
      onSearchChange={(value) => setFilters({ ...filters, search: value })}
      onAdd={formCtrl.openCreate}
      addLabel="Add Owner"
      form={
        formCtrl.isOpen && (
          <FormEmbeddedPanel
            key={`${formKey}-${formCtrl.selectedItem?.id ?? "new"}`}
            title={formCtrl.isEditing ? "Edit Owner" : "Add Owner"}
            fields={ownerCrudConfig.fields}
            schema={ownerCrudConfig.schema}
            selectedRecord={formCtrl.selectedItem}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={isLoading}
            layout={ownerCrudConfig.layout}
          />
        )
      }
      table={
        <div className="flex flex-col gap-4">
          <DataTable
            columns={ownerCrudConfig.columns}
            data={owners}
            loading={isLoading}
            onEdit={formCtrl.openEdit}
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
          open={!!ownerToDelete}
          title="Delete Owner?"
          description={`Are you sure you want to delete ${ownerToDelete?.name}?`}
          loading={deleteLoading}
          onCancel={() => setOwnerToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      }
    />
  );
}
