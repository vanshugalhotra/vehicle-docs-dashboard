"use client";

import React, { useState } from "react";
import { FormEmbeddedPanel } from "@/components/crud/Form/FormEmbeddedPanel";
import { DataTable } from "@/components/crud/DataTable/DataTable";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import { toastUtils } from "@/lib/utils/toastUtils";
import { useCRUDController } from "@/hooks/useCRUDController";
import { CRUDPageLayout } from "@/components/crud/CRUDPageLayout";
import {
  reminderRecipientCrudConfig,
  ReminderRecipient,
} from "@/configs/crud/reminder-recipient.config";
import { PaginationBar } from "@/components/crud/PaginationBar.tsx/PaginationBar";
import { useFormStateController } from "@/hooks/useFormStateController";
import { useEditFocus } from "@/hooks/useEditFocus";
import { AppButton } from "@/components/ui/AppButton";
import { useTriggerReminder } from "@/hooks/useTriggerReminder";
import { Bell } from "lucide-react";

export default function ReminderRecipientsPage() {
  const formCtrl = useFormStateController<ReminderRecipient>("embedded");
  const [itemToDelete, setItemToDelete] = useState<ReminderRecipient | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const { formRef, focusForm } = useEditFocus();

  const handleCancel = () => {
    formCtrl.closeForm();
    setFormKey((k) => k + 1);
  };

  const handleEdit = (item: ReminderRecipient) => {
    formCtrl.openEdit(item);
    toastUtils.info(`Editing recipient ${item.name}`);
    focusForm();
  };

  const {
    data,
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
  } = useCRUDController<ReminderRecipient>(reminderRecipientCrudConfig);

  // ------------------------------
  // TRIGGER REMINDER HOOK
  // ------------------------------
  const { trigger, isLoading: triggerLoading } = useTriggerReminder();

  const handleTriggerReminder = async () => {
    toastUtils.promise(trigger(), {
      loading: "Sending reminders...",
      success: "Reminder emails sent successfully",
      error: "Failed to trigger reminders",
    });
  };

  // ------------------------------
  // SUBMIT HANDLER
  // ------------------------------
  const handleSubmit = async (values: ReminderRecipient) => {
    const action =
      formCtrl.isEditing && formCtrl.selectedItem?.id
        ? update({ id: formCtrl.selectedItem.id, data: values })
        : create(values);

    toastUtils.promise(action, {
      loading: formCtrl.isEditing
        ? "Updating recipient..."
        : "Adding recipient...",
      success: formCtrl.isEditing
        ? "Recipient updated successfully"
        : "Recipient added successfully",
      error: (err) =>
        (err instanceof Error && err.message) ||
        (typeof err === "string" ? err : "Operation failed"),
    });

    setFormKey((k) => k + 1);
    formCtrl.closeForm();
    await refetch();
  };

  // DELETE HANDLING
  const handleDelete = (item: ReminderRecipient) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return;
    setDeleteLoading(true);

    try {
      await remove(itemToDelete.id);
      await refetch();
      toastUtils.success("Recipient deleted successfully");
    } catch (err) {
      toastUtils.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
    }
  };

  // ------------------------------
  // RENDER
  // ------------------------------

  return (
    <CRUDPageLayout
      title="Reminder Recipients"
      isEditing={formCtrl.isEditing}
      onCancelEdit={formCtrl.closeForm}
      search={(filters.search as string) ?? ""}
      onSearchChange={(value) => setFilters({ ...filters, search: value })}
      onAdd={formCtrl.openCreate}
      addLabel="Add Recipient"
      rightActions={
        <div className="flex items-center gap-2">
          <AppButton
            variant="secondary"
            size="md"
            loading={triggerLoading}
            onClick={handleTriggerReminder}
            endIcon={<Bell size={16} />}
          >
            Send Email Reminder
          </AppButton>
        </div>
      }
      form={
        formCtrl.isOpen && (
          <div ref={formRef}>
            <FormEmbeddedPanel
              key={`${formKey}-${formCtrl.selectedItem?.id ?? "new"}`}
              isEditMode={formCtrl.isEditing}
              title={formCtrl.isEditing ? "Edit Recipient" : "Add Recipient"}
              fields={reminderRecipientCrudConfig.fields}
              schema={reminderRecipientCrudConfig.schema}
              selectedRecord={formCtrl.selectedItem}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={isLoading}
              layout={reminderRecipientCrudConfig.layout}
            />
          </div>
        )
      }
      table={
        <div className="flex flex-col gap-4">
          <DataTable
            columns={reminderRecipientCrudConfig.columns(page, pageSize)}
            data={data}
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
          title="Delete Recipient?"
          description={`Are you sure you want to delete ${itemToDelete?.name}?`}
          loading={deleteLoading}
          onCancel={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      }
    />
  );
}
