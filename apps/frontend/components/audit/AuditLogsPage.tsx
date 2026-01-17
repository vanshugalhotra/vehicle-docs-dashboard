"use client";

import React from "react";
import { AppCard } from "@/components/ui/AppCard";
import { HeaderBar } from "../crud/HeaderBar/HeaderBar";
import { TableToolbar } from "@/components/crud/filter/TableToolbar/TableToolbar";
import { PaginationBar } from "@/components/crud/PaginationBar.tsx/PaginationBar";

import type {
  FilterConfig,
  FiltersObject,
  SortOption,
  SortState,
} from "@/lib/types/filter.types";
import type { AuditLogUI } from "@/lib/types/audit.types";

import { AuditLogList } from "./AuditLogList/AuditLogList";

/* ======================================================
 * Props
 * ====================================================== */

export interface AuditLogsPageProps {
  title: string;

  /* ---------- Data ---------- */
  data: AuditLogUI[];
  loading?: boolean;

  /* ---------- Filters ---------- */
  filtersConfig?: FilterConfig[];
  filters: FiltersObject;
  onFiltersChange: (filters: FiltersObject) => void;

  /* ---------- Sorting ---------- */
  sortOptions?: SortOption[];
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;

  /* ---------- Search ---------- */
  search?: string;
  onSearchChange?: (value: string) => void;

  /* ---------- Pagination ---------- */
  page: number;
  pageSize: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function AuditLogsPage({
  title,

  data,
  loading,

  filtersConfig,
  filters,
  onFiltersChange,

  sortOptions,
  sort,
  onSortChange,

  search,
  onSearchChange,

  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: AuditLogsPageProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* ---------- Header ---------- */}
      <HeaderBar
        title={title}
        search={search}
        onSearchChange={onSearchChange}
      />

      {/* ---------- Filters + Sort ---------- */}
      <TableToolbar
        showSearch={false} // handled by HeaderBar
        showFilters={!!filtersConfig?.length}
        showSort={!!sortOptions?.length}
        showReset={true}
        filtersConfig={filtersConfig}
        filters={filters}
        setFilters={onFiltersChange}
        sortOptions={sortOptions}
        sort={sort}
        setSort={onSortChange}
      />

      {/* ---------- Audit Logs ---------- */}
      <AppCard className="p-0 overflow-hidden">
        <AuditLogList logs={data} loading={loading} />

        <div className="border-t border-border/40">
          <PaginationBar
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </AppCard>
    </div>
  );
}
