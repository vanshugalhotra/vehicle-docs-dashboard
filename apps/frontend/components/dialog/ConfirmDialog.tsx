"use client";

import React, { FC } from "react";
import { AppDialog } from "@/components/ui/AppDialog";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  title = "Confirm Action",
  description = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  size = "sm",
}) => {
  return (
    <AppDialog
      open={open}
      onClose={onCancel}
      size={size}
      title={title}
      footer={
        <>
          <AppButton
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            size="sm"
          >
            {cancelText}
          </AppButton>

          <AppButton
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            size="sm"
          >
            {confirmText}
          </AppButton>
        </>
      }
    >
      <AppText size="body" variant="secondary" className="text-center">
        {description}
      </AppText>
    </AppDialog>
  );
};

export default ConfirmDialog;