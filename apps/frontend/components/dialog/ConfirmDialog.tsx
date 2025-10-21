"use client";

import React, { FC } from "react";
import { AlertCircle } from "lucide-react";
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
      title={
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-warning" />
          <span>{title}</span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 pt-4">
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
            disabled={loading}
          >
            {confirmText}
          </AppButton>
        </div>
      }
    >
      <div className="space-y-2 text-center">
        <AppText size="body" variant="secondary">
          {description}
        </AppText>
      </div>
    </AppDialog>
  );
};

export default ConfirmDialog;