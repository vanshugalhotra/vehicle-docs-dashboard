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
import { DocumentType, documentTypeCrudConfig } from "@/configs/crud/document-types.config";

export default function DocumentTypesPage() {
  const formCtrl = useFormStateController<DocumentType>("embedded");
  const [documentTypeToDelete, setDocumentTypeToDelete] = useState<DocumentType | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleCancel = () => {
    formCtrl.closeForm();
    setFormKey((k) => k + 1);
  };

  const {
    data: documentTypes,
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
  } = useCRUDController<DocumentType>(documentTypeCrudConfig);

  const handleSubmit = async (values: DocumentType) => {
    const action =
      formCtrl.isEditing && formCtrl.selectedItem?.id
        ? update({ id: formCtrl.selectedItem.id, data: values })
        : create(values);

    toastUtils.promise(action, {
      loading: formCtrl.isEditing ? "Updating document type..." : "Adding document type...",
      success: formCtrl.isEditing
        ? "Document type updated successfully"
        : "Document type added successfully",
      error: (err) =>
        (err instanceof Error && err.message) ||
        (typeof err === "string" ? err : "Operation failed"),
    });

    setFormKey((k) => k + 1);
    formCtrl.closeForm();
    await refetch();
  };

  const handleDelete = (documentType: DocumentType) => setDocumentTypeToDelete(documentType);

  const handleConfirmDelete = async () => {
    if (!documentTypeToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await remove(documentTypeToDelete.id);
      await refetch();
      toastUtils.success("Document type deleted successfully");
    } catch (err) {
      toastUtils.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
      setDocumentTypeToDelete(null);
    }
  };

  return (
    <CRUDPageLayout
      title="Document Types"
      isEditing={formCtrl.isEditing}
      onCancelEdit={formCtrl.closeForm}
      search={(filters.search as string) ?? ""}
      onSearchChange={(value) => setFilters({ ...filters, search: value })}
      onAdd={formCtrl.openCreate}
      addLabel="Add Document Type"
      form={
        formCtrl.isOpen && (
          <FormEmbeddedPanel
            key={`${formKey}-${formCtrl.selectedItem?.id ?? "new"}`}
            isEditMode={formCtrl.isEditing}
            title={formCtrl.isEditing ? "Edit Document Type" : "Add Document Type"}
            fields={documentTypeCrudConfig.fields}
            schema={documentTypeCrudConfig.schema}
            selectedRecord={formCtrl.selectedItem}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={isLoading}
            layout={documentTypeCrudConfig.layout}
          />
        )
      }
      table={
        <div className="flex flex-col gap-4">
          <DataTable
            columns={documentTypeCrudConfig.columns}
            data={documentTypes}
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
          open={!!documentTypeToDelete}
          title="Delete Document Type?"
          description={`Are you sure you want to delete "${documentTypeToDelete?.name}"? This action cannot be undone.`}
          loading={deleteLoading}
          onCancel={() => setDocumentTypeToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      }
    />
  );
}