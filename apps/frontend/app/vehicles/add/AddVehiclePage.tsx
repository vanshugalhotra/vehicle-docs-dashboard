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
import { Vehicle, vehicleCrudConfig } from "@/configs/crud/vehicles.config";
import { TableToolbar } from "@/components/crud/filter/TableToolbar/TableToolbar";
import { useEditFocus } from "@/hooks/useEditFocus";
import { useEditFromQuery } from "@/hooks/useEditFormQuery";

export default function AddVehiclesPage() {
  const formCtrl = useFormStateController<Vehicle>("embedded");
  const [itemToDelete, setItemToDelete] = useState<Vehicle | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleCancel = () => {
    formCtrl.closeForm();
    setFormKey((k) => k + 1);
  };

  const {
    data: vehicles,
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
    setSort,
    sort,
  } = useCRUDController<Vehicle>(vehicleCrudConfig);

  const handleSubmit = async (values: Vehicle) => {
    const action =
      formCtrl.isEditing && formCtrl.selectedItem?.id
        ? update({ id: formCtrl.selectedItem.id, data: values })
        : create(values);

    toastUtils.promise(action, {
      loading: formCtrl.isEditing ? "Updating vehicle..." : "Adding vehicle...",
      success: formCtrl.isEditing
        ? "Vehicle updated successfully"
        : "Vehicle added successfully",
      error: (err) =>
        (err instanceof Error && err.message) ||
        (typeof err === "string" ? err : "Operation failed"),
    });

    setFormKey((k) => k + 1);
    formCtrl.closeForm();
    await refetch();
  };

  const handleDelete = (record: Vehicle) => setItemToDelete(record);

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await remove(itemToDelete.id);
      await refetch();
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
  const { formRef, focusForm } = useEditFocus();
  const handleEdit = (item: Vehicle) => {
    formCtrl.openEdit(item);
    toastUtils.info(`Editing vehicle ${item.licensePlate}`);
    focusForm();
  };

  useEditFromQuery<Vehicle>(
    vehicleCrudConfig.baseUrl,
    (record) => formCtrl.openEdit(record),
    () => focusForm()
  );

  return (
    <CRUDPageLayout
      title="Vehicles"
      isEditing={formCtrl.isEditing}
      onCancelEdit={formCtrl.closeForm}
      search={(filters.search as string) ?? ""}
      onSearchChange={(value) => setFilters({ ...filters, search: value })}
      onAdd={formCtrl.openCreate}
      addLabel="Add Vehicle"
      layout="stacked"
      form={
        formCtrl.isOpen && (
          <div ref={formRef}>
            <FormEmbeddedPanel
              key={`${formKey}-${formCtrl.selectedItem?.id ?? "new"}`}
              isEditMode={formCtrl.isEditing}
              title={formCtrl.isEditing ? "Edit Vehicle" : "Add Vehicle"}
              fields={vehicleCrudConfig.fields}
              schema={vehicleCrudConfig.schema}
              selectedRecord={formCtrl.selectedItem}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={isLoading}
              layout={vehicleCrudConfig.layout}
            />
          </div>
        )
      }
      table={
        <div className="flex flex-col gap-4">
          <TableToolbar
            filtersConfig={vehicleCrudConfig.filters}
            sortOptions={vehicleCrudConfig.sortOptions}
            filters={filters}
            setFilters={setFilters}
            sort={sort}
            setSort={setSort}
          />
          <DataTable
            columns={vehicleCrudConfig.columns(page, pageSize)}
            data={vehicles}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={(item) => {
              console.log("View vehicle:", item);
            }}
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
          open={!!itemToDelete}
          title="Delete Vehicle?"
          description={`Are you sure you want to delete ${itemToDelete?.licensePlate}?`}
          loading={deleteLoading}
          onCancel={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      }
    />
  );
}
