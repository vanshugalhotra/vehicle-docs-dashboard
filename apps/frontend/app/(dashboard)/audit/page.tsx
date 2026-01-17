"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

import { useAuditLogsController } from "@/hooks/useAuditLogsController";
import {
  getAuditFiltersConfig,
  auditSortOptions,
  auditDefaults,
} from "@/configs/audit.config";
import { AuditLogsPage } from "@/components/audit/AuditLogsPage";

/**
 * Global Audit Logs Page
 */
export default function AuditPage() {
  const searchParams = useSearchParams();

  const initialFilters = searchParams.has("filters")
    ? JSON.parse(searchParams.get("filters")!)
    : {};

  const controller = useAuditLogsController({
    mode: "global",
    defaultPageSize: auditDefaults.pageSize,
    defaultFilters: initialFilters,
  });

  return (
    <AuditLogsPage
      title="Audit Trail"
      data={controller.data}
      loading={controller.isLoading}
      filtersConfig={getAuditFiltersConfig({ includeEntityFilters: true })}
      filters={controller.filters}
      onFiltersChange={controller.setFilters}
      sortOptions={auditSortOptions}
      sort={controller.sort}
      onSortChange={controller.setSort}
      search={controller.filters.search as string}
      onSearchChange={(val) =>
        controller.setFilters((prev) => ({ ...prev, search: val }))
      }
      page={controller.page}
      pageSize={controller.pageSize}
      totalCount={controller.total}
      onPageChange={controller.setPage}
      onPageSizeChange={controller.setPageSize}
    />
  );
}
