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
  VehicleType,
  vehicleTypeCrudConfig,
} from "@/configs/crud/vehicle-types.config";
import { TableToolbar } from "@/components/crud/filter/TableToolbar/TableToolbar";
import { useEditFocus } from "@/hooks/useEditFocus";

export default function VehicleTypesPage() {
  const formCtrl = useFormStateController<VehicleType>("embedded");
  const [itemToDelete, setItemToDelete] = useState<VehicleType | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleCancel = () => {
    formCtrl.closeForm();
    setFormKey((k) => k + 1);
  };

  const { formRef, focusForm } = useEditFocus();
  const handleEdit = (item: VehicleType) => {
    formCtrl.openEdit(item);
    toastUtils.info(`Editing Type ${item.name}`);
    focusForm();
  };

  const {
    data: types,
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
  } = useCRUDController<VehicleType>(vehicleTypeCrudConfig);

  const handleSubmit = async (values: VehicleType) => {
    const action =
      formCtrl.isEditing && formCtrl.selectedItem?.id
        ? update({ id: formCtrl.selectedItem.id, data: values })
        : create(values);

    toastUtils.promise(action, {
      loading: formCtrl.isEditing ? "Updating type..." : "Adding type...",
      success: formCtrl.isEditing
        ? "Vehicle type updated successfully"
        : "Vehicle type added successfully",
      error: (err) =>
        (err instanceof Error && err.message) ||
        (typeof err === "string" ? err : "Operation failed"),
    });

    setFormKey((k) => k + 1);
    formCtrl.closeForm();
    await refetch();
  };

  const handleDelete = (record: VehicleType) => setItemToDelete(record);

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await remove(itemToDelete.id);
      await refetch();
      toastUtils.success("Vehicle type deleted successfully");
    } catch (err) {
      toastUtils.error(
        err instanceof Error ? err.message : "Failed to delete vehicle type"
      );
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
    }
  };

  return (
    <CRUDPageLayout
      title="Vehicle Types"
      isEditing={formCtrl.isEditing}
      onCancelEdit={formCtrl.closeForm}
      search={(filters.search as string) ?? ""}
      onSearchChange={(value) => setFilters({ ...filters, search: value })}
      onAdd={formCtrl.openCreate}
      addLabel="Add Vehicle Type"
      form={
        formCtrl.isOpen && (
          <div ref={formRef}>
            <FormEmbeddedPanel
              key={`${formKey}-${formCtrl.selectedItem?.id ?? "new"}`}
              isEditMode={formCtrl.isEditing}
              title={
                formCtrl.isEditing ? "Edit Vehicle Type" : "Add Vehicle Type"
              }
              fields={vehicleTypeCrudConfig.fields}
              schema={vehicleTypeCrudConfig.schema}
              selectedRecord={formCtrl.selectedItem}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={isLoading}
              layout={vehicleTypeCrudConfig.layout}
            />
          </div>
        )
      }
      table={
        <div className="flex flex-col gap-4">
          <TableToolbar
            filtersConfig={vehicleTypeCrudConfig.filters}
            sortOptions={vehicleTypeCrudConfig.sortOptions}
            filters={filters}
            setFilters={setFilters}
            sort={sort}
            setSort={setSort}
          />
          <DataTable
            columns={vehicleTypeCrudConfig.columns(page, pageSize)}
            data={types}
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
          open={!!itemToDelete}
          title="Delete Type?"
          description={`Are you sure you want to delete ${itemToDelete?.name}?`}
          loading={deleteLoading}
          onCancel={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      }
    />
  );
}
