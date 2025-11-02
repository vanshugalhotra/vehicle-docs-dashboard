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
import { VehicleCategory, vehicleCategoryCrudConfig } from "@/configs/crud/vehicle-categories.config";

export default function VehicleCategoriesPage() {
  const formCtrl = useFormStateController<VehicleCategory>("embedded");
  const [categoryToDelete, setCategoryToDelete] =
    useState<VehicleCategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleCancel = () => {
    formCtrl.closeForm();
    setFormKey((k) => k + 1); // reset form
};

const {
    data: categories,
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
} = useCRUDController<VehicleCategory>(vehicleCategoryCrudConfig);

const handleSubmit = async (values: VehicleCategory) => {
    const action =
    formCtrl.isEditing && formCtrl.selectedItem?.id
    ? update({ id: formCtrl.selectedItem.id, data: values })
    : create(values);
    
    toastUtils.promise(action, {
        loading: formCtrl.isEditing ? "Updating category..." : "Adding category...",
        success: formCtrl.isEditing
        ? "Category updated successfully"
        : "Category added successfully",
        error: (err) =>
            (err instanceof Error && err.message) ||
        (typeof err === "string" ? err : "Operation failed"),
    });
    
    setFormKey((k) => k + 1); // reset form
    formCtrl.closeForm();
    await refetch();
  };

  const handleDelete = (category: VehicleCategory) =>
    setCategoryToDelete(category);

  const handleConfirmDelete = async () => {
    if (!categoryToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await remove(categoryToDelete.id);
      await refetch();
      toastUtils.success("Vehicle category deleted successfully");
    } catch (err) {
      toastUtils.error(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    } finally {
      setDeleteLoading(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <CRUDPageLayout
      title="Vehicle Categories"
      isEditing={formCtrl.isEditing}
      onCancelEdit={formCtrl.closeForm}
      search={(filters.search as string) ?? ""}
      onSearchChange={(value) => setFilters({ ...filters, search: value })}
      onAdd={formCtrl.openCreate}
      addLabel="Add Category"
      form={
        formCtrl.isOpen && (
          <FormEmbeddedPanel
            key={`${formKey}-${formCtrl.selectedItem?.id ?? "new"}`}
            isEditMode={formCtrl.isEditing}
            title={formCtrl.isEditing ? "Edit Category" : "Add Category"}
            fields={vehicleCategoryCrudConfig.fields}
            schema={vehicleCategoryCrudConfig.schema}
            selectedRecord={formCtrl.selectedItem}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={isLoading}
            layout={vehicleCategoryCrudConfig.layout}
          />
        )
      }
      table={
        <div className="flex flex-col gap-4">
          <DataTable
            columns={vehicleCategoryCrudConfig.columns}
            data={categories}
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
          open={!!categoryToDelete}
          title="Delete Category?"
          description={`Are you sure you want to delete ${categoryToDelete?.name}?`}
          loading={deleteLoading}
          onCancel={() => setCategoryToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      }
    />
  );
}
