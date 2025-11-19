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
        <div className="flex flex-col items-center gap-4 mb-4 animate-fade-in-down">
          <div className="p-3 bg-warning/10 rounded-full border border-warning/20">
            <AlertCircle className="h-6 w-6 text-warning" aria-hidden="true" />
          </div>
          <AppText size="heading2" className="font-bold text-text-primary text-center leading-tight">
            {title}
          </AppText>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 pt-6">
          <AppButton
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            size="sm"
            className="px-4 py-2 transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02]"
          >
            {cancelText}
          </AppButton>
          <AppButton
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            size="sm"
            disabled={loading}
            className="px-4 py-2 transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02]"
          >
            {confirmText}
          </AppButton>
        </div>
      }
    >
      <div className="py-6 text-center space-y-4 bg-surface-subtle/30 rounded-lg border border-border-subtle/50 animate-fade-in-up">
        <AppText size="body" variant="secondary" className="max-w-sm mx-auto leading-relaxed px-4">
          {description}
        </AppText>
      </div>
    </AppDialog>
  );
};

export default ConfirmDialog;