"use client";

import React, { FC } from "react";
import { AppDialog } from "@/components/ui/AppDialog";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { transition } from "../tokens/designTokens";

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
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className={transition.base}
          >
            {cancelText}
          </AppButton>

          <AppButton
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            className={transition.base}
          >
            {confirmText}
          </AppButton>
        </>
      }
    >
      <AppText variant="secondary" size="heading2">
        {description}
      </AppText>
    </AppDialog>
  );
};

export default ConfirmDialog;
