"use client";

import React, { useState, useEffect } from "react";
import { HeaderBar } from "@/components/crud/HeaderBar/HeaderBar";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { DataTable } from "@/components/crud/DataTable/DataTable";
import { FormEmbeddedPanel } from "@/components/crud/Form/FormEmbeddedPanel";
import VehicleSelector from "./VehicleSelector";
import DocumentTypeSelector from "./DocumentTypeSelector";
import { useCRUDController } from "@/hooks/useCRUDController";
import { useFormStateController } from "@/hooks/useFormStateController";
import { VehicleResponse } from "@/lib/types/vehicle.types";
import {
  linkageCrudConfig,
  LinkageEntity,
} from "@/configs/crud/linkage.config";
import { AppBadge } from "@/components/ui/AppBadge";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import { toastUtils } from "@/lib/utils/toastUtils";
import { PaginationBar } from "@/components/crud/PaginationBar.tsx/PaginationBar";
import { Search } from "lucide-react";
import { useEditFocus } from "@/hooks/useEditFocus";
import { useEditFromQuery } from "@/hooks/useEditFormQuery";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { apiRoutes } from "@/lib/apiRoutes";
import { DocumentTypeResponse } from "@/lib/types/document-type.types";

export default function AddLinkagePage() {
  // -------------------------------
  // 🔹 Selected Vehicle
  // -------------------------------
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleResponse | null>(null);

  // -------------------------------
  // 🔹 Selected Document Type
  // -------------------------------
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<DocumentTypeResponse | null>(null);

  // -------------------------------
  // 🔹 CRUD Controller
  // -------------------------------
  const crud = useCRUDController<LinkageEntity>(linkageCrudConfig);
  const {
    data,
    isLoading,
    create,
    update,
    remove,
    refetch,
    setFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    sort,
    setSort,
  } = crud;

  // -------------------------------
  // 🔹 Form Controller
  // -------------------------------
  const formCtrl = useFormStateController<LinkageEntity>("embedded");
  const [formKey, setFormKey] = useState(0);

  const handleCancel = () => {
    formCtrl.closeForm();
    setFormKey((k) => k + 1);
  };

  const handleSubmit = async (values: Partial<LinkageEntity>) => {
    if (!selectedVehicle?.id || !selectedDocumentType?.id) {
      toastUtils.error("Vehicle and Document Type are required.");
      return;
    }

    const payload: LinkageEntity = {
      documentNo: values.documentNo?.trim() || "",
      startDate: values.startDate!,
      expiryDate: values.expiryDate!,
      notes: values.notes ?? "",
      amount: values.amount ?? "",
      vehicleId: selectedVehicle.id,
      documentTypeId: selectedDocumentType.id,
      link: values.link,
    };

    const action =
      formCtrl.isEditing && formCtrl.selectedItem?.id
        ? update({ id: formCtrl.selectedItem.id!, data: payload })
        : create(payload);

    toastUtils.promise(action, {
      loading: formCtrl.isEditing ? "Updating linkage..." : "Adding linkage...",
      success: formCtrl.isEditing
        ? "Linkage updated successfully"
        : "Linkage added successfully",
      error: (err) => (err instanceof Error ? err.message : "Operation failed"),
    });

    setFormKey((k) => k + 1);
    formCtrl.closeForm();
    await refetch();
  };
  const { formRef, focusForm } = useEditFocus();

  useEditFromQuery<LinkageEntity>(
    linkageCrudConfig.baseUrl,
    async (record) => {
      await loadVehicleAndDocumentType(record);
      formCtrl.openEdit(record);
    },
    () => focusForm()
  );

  // -------------------------------
  // 🔹 Deletion
  // -------------------------------
  const [itemToDelete, setItemToDelete] = useState<LinkageEntity | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = (record: LinkageEntity) => setItemToDelete(record);

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await remove(itemToDelete.id);
      await refetch();
      toastUtils.success("Document linkage deleted successfully");
    } catch {
      toastUtils.error("Failed to delete document linkage");
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
    }
  };

  // -------------------------------
  // 🔹 Watch Vehicle → update filters
  // -------------------------------
  useEffect(() => {
    if (selectedVehicle) {
      setFilters({ vehicleId: selectedVehicle.id });
      refetch();
    } else {
      setFilters({});
    }
  }, [selectedVehicle, setFilters, refetch]);

  async function loadVehicleAndDocumentType(record: LinkageEntity) {
    // --- Load full vehicle (required for VehicleSelector) ---
    if (record.vehicleId && record.documentTypeId) {
      try {
        const vehicle = await fetchWithAuth<VehicleResponse>(
          apiRoutes.vehicles.detail(record.vehicleId)
        );
        const document_type = await fetchWithAuth<DocumentTypeResponse>(
          apiRoutes.document_types.detail(record.documentTypeId)
        );

        if (vehicle) {
          setSelectedVehicle(vehicle);
        }

        if (document_type) {
          setSelectedDocumentType(document_type);
        }
      } catch (err) {
        console.error("Failed to load vehicle for edit:", err);
      }
    }
  }

  // -------------------------------
  // 🔹 Render
  // -------------------------------
  return (
    <div className="flex flex-col space-y-6">
      <HeaderBar title="Link Vehicle Documents" />

      {/* Vehicle & DocumentType Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <AppCard bordered hoverable padded className="flex-1">
            <VehicleSelector
              onSelect={setSelectedVehicle}
              value={selectedVehicle}
            />
          </AppCard>
        </div>
        <div className="flex flex-col space-y-4">
          <AppCard bordered hoverable padded className="flex-1">
            <DocumentTypeSelector
              onSelect={setSelectedDocumentType}
              value={selectedDocumentType}
            />
          </AppCard>
        </div>
      </div>

      {/* Table + Embedded Form */}
      {/* Form */}
      {formCtrl.isOpen && (
        <div className="mt-0" ref={formRef}>
          <FormEmbeddedPanel<LinkageEntity>
            key={`${formKey}-${formCtrl.selectedItem?.id ?? "new"}`}
            title={
              formCtrl.isEditing
                ? "Edit Linked Document"
                : "Add New Linked Document"
            }
            isEditMode={formCtrl.isEditing}
            fields={linkageCrudConfig.fields}
            schema={linkageCrudConfig.schema}
            selectedRecord={{
              ...formCtrl.selectedItem,
              vehicleId: selectedVehicle?.name,
              documentTypeId:
                selectedDocumentType?.name ||
                formCtrl.selectedItem?.documentTypeName ||
                "—",
              startDate: formCtrl.isEditing
                ? formCtrl.selectedItem?.startDate
                : new Date(),
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={isLoading}
            layout={linkageCrudConfig.layout}
          />
        </div>
      )}
      {selectedVehicle ? (
        <AppCard bordered hoverable padded>
          <AppText size="heading3" className="mb-3">
            Linked Documents{" "}
            <AppBadge variant="info" className="ml-4 text-xl!">
              {selectedVehicle.name}
            </AppBadge>
          </AppText>

          {/* Table */}
          <DataTable<LinkageEntity>
            columns={linkageCrudConfig.columns(page, pageSize)}
            data={data}
            loading={isLoading}
            onEdit={async (record) => {
              await loadVehicleAndDocumentType(record);
              formCtrl.openEdit(record);
              toastUtils.info(`Editing Linkage ${record.documentNo}`);
              focusForm();
            }}
            onDelete={handleDelete}
            sort={sort}
            setSort={setSort}
            className="my-4"
          />

          <PaginationBar
            page={page}
            pageSize={pageSize}
            totalCount={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </AppCard>
      ) : (
        <AppCard bordered>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-primary-light/80 p-2 rounded-full mb-3">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <AppText size="heading3" variant="primary">
              Please select a vehicle
            </AppText>
            <AppText size="body" variant="secondary">
              to view or add linked documents.
            </AppText>
          </div>
        </AppCard>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!itemToDelete}
        title="Delete Linked Document?"
        description={`Are you sure you want to delete ${
          itemToDelete?.documentNo ?? "this record"
        }?`}
        loading={deleteLoading}
        onCancel={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
