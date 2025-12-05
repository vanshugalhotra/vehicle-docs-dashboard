"use client";

import React from "react";
import { AppButton } from "../ui/AppButton";
import { Download } from "lucide-react";
import { toastUtils } from "@/lib/utils/toastUtils";
import { useExport } from "@/hooks/useExport";
import { ExportType } from "@/lib/types/export.types";

interface ExportActionProps {
  exportTable?: ExportType;
}

/**
 * Handles export button, including loading state, toast notifications, and download.
 */
export const ExportAction: React.FC<ExportActionProps> = ({ exportTable }) => {
  const { exportData, isLoading } = useExport(exportTable, {
    asFile: true,
  });

  if (!exportTable) {
    return (
      <AppButton
        variant="primary"
        size="md"
        disabled
        endIcon={<Download size={16} />}
      >
        Export
      </AppButton>
    );
  }

  return (
    <AppButton
      variant="primary"
      size="md"
      onClick={async () => {
        try {
          await exportData();
          toastUtils.success(`${exportTable} Exported Successfully!`);
        } catch (err: unknown) {
          toastUtils.error(
            (err instanceof Error ? err.message : String(err)) ||
              "Export failed"
          );
        }
      }}
      endIcon={<Download size={16} />}
      disabled={isLoading}
    >
      {isLoading ? "Exporting..." : "Export"}
    </AppButton>
  );
};
