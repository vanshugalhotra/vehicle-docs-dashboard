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
import {
  Location,
  locationCrudConfig,
} from "@/configs/crud/locations.config";

export default function LocationsPage() {
  const formCtrl = useFormStateController<Location>("embedded");
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleCancel = () => {
    formCtrl.closeForm();
    setFormKey((k) => k + 1); // remount form to reset all fields
  };

  const {
    data: locations,
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
  } = useCRUDController<Location>(locationCrudConfig);

  const handleSubmit = async (values: Location) => {
    const action =
      formCtrl.isEditing && formCtrl.selectedItem?.id
        ? update({ id: formCtrl.selectedItem.id, data: values })
        : create(values);

    toastUtils.promise(action, {
      loading: formCtrl.isEditing
        ? "Updating location..."
        : "Adding location...",
      success: formCtrl.isEditing
        ? "Location updated successfully"
        : "Location added successfully",
      error: (err) =>
        (err instanceof Error && err.message) ||
        (typeof err === "string" ? err : "Operation failed"),
    });

    setFormKey((k) => k + 1);
    formCtrl.closeForm();
    await refetch();
  };

  const handleDelete = (location: Location) => setLocationToDelete(location);

  const handleConfirmDelete = async () => {
    if (!locationToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await remove(locationToDelete.id);
      await refetch();
      toastUtils.success("Location deleted successfully");
    } catch (err) {
      toastUtils.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
      setLocationToDelete(null);
    }
  };

  return (
    <CRUDPageLayout
      title="Locations"
      isEditing={formCtrl.isEditing}
      onCancelEdit={formCtrl.closeForm}
      search={(filters.search as string) ?? ""}
      onSearchChange={(value) => setFilters({ ...filters, search: value })}
      onAdd={formCtrl.openCreate}
      addLabel="Add Location"
      form={
        formCtrl.isOpen && (
          <FormEmbeddedPanel
            key={`${formKey}-${formCtrl.selectedItem?.id ?? "new"}`}
            title={formCtrl.isEditing ? "Edit Location" : "Add Location"}
            fields={locationCrudConfig.fields}
            schema={locationCrudConfig.schema}
            selectedRecord={formCtrl.selectedItem}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={isLoading}
            layout="stacked"
          />
        )
      }
      table={
        <div className="flex flex-col gap-4">
          <DataTable
            columns={locationCrudConfig.columns}
            data={locations}
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
          open={!!locationToDelete}
          title="Delete Location?"
          description={`Are you sure you want to delete ${locationToDelete?.name}?`}
          loading={deleteLoading}
          onCancel={() => setLocationToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      }
    />
  );
}
