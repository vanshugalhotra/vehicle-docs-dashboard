"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchWithAuth, fetchFile } from "@/lib/utils/fetchWithAuth";
import { apiRoutes } from "@/lib/apiRoutes";
import { ExportType } from "@/lib/types/export.types";

interface UseExportOptions {
  asFile?: boolean;
}

/**
 * Hook to trigger export for a given type.
 * Automatically downloads XLSX if asFile=true, otherwise returns JSON.
 */
export function useExport(type: ExportType, options?: UseExportOptions) {
  const mutation = useMutation({
    mutationFn: async () => {
      const asFileParam = options?.asFile ?? true;
      const url = `${apiRoutes.export.base}/${type}?asFile=${asFileParam}`;

      if (asFileParam) {
        // Use fetchFile for binary download
        const response = await fetchFile(url, { method: "GET" });

        // Download XLSX
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;

        // Extract filename from Content-Disposition header
        const disposition = response.headers.get("Content-Disposition");
        let filename = type + ".xlsx";
        if (disposition?.includes("filename=")) {
          filename = disposition.split("filename=")[1].replace(/"/g, "");
        }

        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        return { success: true };
      } else {
        // Use fetchWithAuth for JSON response
        const json = await fetchWithAuth(url, { method: "GET" });
        return json;
      }
    },
  });

  return {
    exportData: () => mutation.mutateAsync(),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
