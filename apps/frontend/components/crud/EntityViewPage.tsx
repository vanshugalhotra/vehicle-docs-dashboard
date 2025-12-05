"use client";

import React from "react";
import { AppCard } from "@/components/ui/AppCard";
import { DataTable } from "../crud/DataTable/DataTable";
import { PaginationBar } from "../crud/PaginationBar.tsx/PaginationBar";
import { TableToolbar } from "../crud/filter/TableToolbar/TableToolbar";
import { HeaderBar } from "./HeaderBar/HeaderBar";
import { Plus } from "lucide-react";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";
import { ColumnDef } from "@tanstack/react-table";
import {
  FilterConfig,
  FiltersObject,
  SortOption,
  SortState,
} from "@/lib/types/filter.types";
import { ExportType } from "@/lib/types/export.types";
import { ExportAction } from "../actions/ExportAction";
import { AppButton } from "../ui/AppButton";

interface EntityViewPageProps<TData extends { id?: string | number }> {
  title: string;

  // Table
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;

  // Filters / Sorting / Search
  filtersConfig?: FilterConfig[];
  filters: FiltersObject;
  onFiltersChange: (filters: FiltersObject) => void;

  businessFiltersConfig?: FilterConfig[];
  businessFilters?: FiltersObject;
  onBusinessFiltersChange?: (filters: FiltersObject) => void;

  sortOptions?: SortOption[];
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;

  search?: string;
  onSearchChange?: (value: string) => void;

  // Actions
  onAdd?: () => void;
  onEdit?: (item: TData) => void;
  onView?: (item: TData) => void;
  onRenew?: (item: TData) => void;

  // Export
  exportTable?: ExportType;

  // Delete Flow (external control)
  handleDelete?: (item: TData) => void;
  confirmDelete?: () => Promise<void>;
  deleteLoading?: boolean;
  itemToDelete?: TData | null;
  onCancelDelete?: () => void;
  deleteDescription?: (item: TData) => string;

  // Pagination
  page: number;
  pageSize: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // Insights placeholder (to be added later)
  insightsConfig?: unknown;
}

/**
 * EntityViewPage
 * Reusable listing layout — HeaderBar + Filters + DataTable + Pagination + external delete flow.
 */
export function EntityViewPage<TData extends { id?: string | number }>({
  title,
  columns,
  data,
  loading,
  filtersConfig,
  filters,
  onFiltersChange,
  businessFiltersConfig = [],
  businessFilters,
  onBusinessFiltersChange,
  sortOptions,
  sort,
  onSortChange,
  search,
  onSearchChange,
  onAdd,
  onEdit,
  onView,
  onRenew,
  exportTable,
  handleDelete,
  confirmDelete,
  deleteLoading,
  itemToDelete,
  onCancelDelete,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  deleteDescription,
}: EntityViewPageProps<TData>) {
  return (
    <div className="flex flex-col gap-4">
      {/* ---------- Header Bar ---------- */}
      <HeaderBar
        title={title}
        search={search}
        onSearchChange={onSearchChange}
        rightActions={
          <div className="flex items-center gap-2">
            <ExportAction exportTable={exportTable} />
            {onAdd && (
              <AppButton
                size="md"
                onClick={onAdd}
                variant="secondary"
                startIcon={<Plus className="h-4 w-4" />}
              >
                Add {title}
              </AppButton>
            )}
          </div>
        }
      />

      {/* ---------- Filters + Sorting ---------- */}
      <TableToolbar
        showSearch={false} // handled by HeaderBar
        showFilters={!!filtersConfig?.length}
        showSort={!!sortOptions?.length}
        showReset={true}
        filtersConfig={filtersConfig}
        filters={filters}
        setFilters={onFiltersChange}
        businessFiltersConfig={businessFiltersConfig}
        businessFilters={businessFilters}
        setBusinessFilters={onBusinessFiltersChange}
        sortOptions={sortOptions}
        sort={sort}
        setSort={onSortChange}
      />

      {/* ---------- Data Table ---------- */}
      <AppCard className="p-0 overflow-hidden">
        <DataTable<TData>
          columns={columns}
          data={data}
          loading={loading}
          sort={sort}
          setSort={onSortChange}
          onView={onView}
          onEdit={onEdit}
          onRenew={onRenew}
          onDelete={handleDelete}
        />
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

      {/* ---------- Delete Confirm Dialog ---------- */}
      <ConfirmDialog
        open={!!itemToDelete}
        title={`Delete ${title}?`}
        description={
          itemToDelete ? deleteDescription?.(itemToDelete) : undefined
        }
        loading={deleteLoading}
        onCancel={onCancelDelete ?? (() => {})}
        onConfirm={confirmDelete ?? (() => {})}
      />
    </div>
  );
}
