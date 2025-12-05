"use client";

import React, { useState } from "react";
import { FormEmbeddedPanel } from "@/components/crud/Form/FormEmbeddedPanel";
import { DataTable } from "@/components/crud/DataTable/DataTable";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import { toastUtils } from "@/lib/utils/toastUtils";
import { useCRUDController } from "@/hooks/useCRUDController";
import { CRUDPageLayout } from "@/components/crud/CRUDPageLayout";
import { Driver, driverCrudConfig } from "@/configs/crud/drivers.config";
import { PaginationBar } from "@/components/crud/PaginationBar.tsx/PaginationBar";
import { useFormStateController } from "@/hooks/useFormStateController";
import { useEditFocus } from "@/hooks/useEditFocus";

export default function DriversPage() {
  const formCtrl = useFormStateController<Driver>("embedded");
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formKey, setFormKey] = useState(0);

  const handleCancel = () => {
    formCtrl.closeForm();
    setFormKey((k) => k + 1); // remount form to reset all fields
  };

  const { formRef, focusForm } = useEditFocus();
  const handleEdit = (item: Driver) => {
    formCtrl.openEdit(item);
    toastUtils.info(`Editing driver ${item.name}`);
    focusForm();
  };

  const {
    data: drivers,
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
    sort,
    setSort,
  } = useCRUDController<Driver>(driverCrudConfig);

  // -------------------
  // HANDLERS
  // -------------------

  const handleSubmit = async (values: Driver) => {
    const action =
      formCtrl.isEditing && formCtrl.selectedItem?.id
        ? update({ id: formCtrl.selectedItem.id, data: values })
        : create(values);

    toastUtils.promise(action, {
      loading: formCtrl.isEditing ? "Updating driver..." : "Adding driver...",
      success: formCtrl.isEditing
        ? "Driver updated successfully"
        : "Driver added successfully",
      error: (err) =>
        (err instanceof Error && err.message) ||
        (typeof err === "string" ? err : "Operation failed"),
    });

    setFormKey((k) => k + 1);
    formCtrl.closeForm();
    await refetch();
  };

  const handleDelete = (driver: Driver) => setDriverToDelete(driver);

  const handleConfirmDelete = async () => {
    if (!driverToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await remove(driverToDelete.id);
      await refetch();
      toastUtils.success("Driver deleted successfully");
    } catch (err) {
      toastUtils.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
      setDriverToDelete(null);
    }
  };

  // -------------------
  // RENDER
  // -------------------

  return (
    <CRUDPageLayout
      title="Drivers"
      isEditing={formCtrl.isEditing}
      onCancelEdit={formCtrl.closeForm}
      search={(filters.search as string) ?? ""}
      onSearchChange={(value) => setFilters({ ...filters, search: value })}
      onAdd={formCtrl.openCreate}
      addLabel="Add Driver"
      exportTable={driverCrudConfig.exportTable}
      form={
        formCtrl.isOpen && (
          <div ref={formRef}>
            <FormEmbeddedPanel
              key={`${formKey}-${formCtrl.selectedItem?.id ?? "new"}`}
              isEditMode={formCtrl.isEditing}
              title={formCtrl.isEditing ? "Edit Driver" : "Add Driver"}
              fields={driverCrudConfig.fields}
              schema={driverCrudConfig.schema}
              selectedRecord={formCtrl.selectedItem}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={isLoading}
              layout={driverCrudConfig.layout}
            />
          </div>
        )
      }
      table={
        <div className="flex flex-col gap-4">
          <DataTable
            columns={driverCrudConfig.columns(page, pageSize)}
            data={drivers}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sort={sort}
            setSort={setSort}
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
