"use client";

import React, { useCallback, useMemo } from "react";
import { ArrowUpDown, X, Search } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppSelect, Option } from "@/components/ui/AppSelect";
import { AppInput } from "@/components/ui/AppInput";
import { FilterPanel } from "../FilterPanel/FilterPanel";
import type {
  FilterConfig,
  SortOption,
  FiltersObject,
} from "@/lib/types/filter.types";

interface TableToolbarProps {
  /** 🔹 Config-driven optional elements */
  showSearch?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  showReset?: boolean;

  /** 🔹 Filter configuration */
  filtersConfig?: FilterConfig[];
  filters: FiltersObject;
  setFilters: (filters: FiltersObject) => void;

  /** 🔹 Sort configuration */
  sortOptions?: SortOption[];
  sort?: { field?: string; order?: "asc" | "desc" };
  setSort?: (sort: { field?: string; order?: "asc" | "desc" }) => void;

  /** Layout control */
  compact?: boolean;
}

/**
 * Flexible TableToolbar — use only the pieces you need:
 * search, filters, sort, reset.
 */
export const TableToolbar: React.FC<TableToolbarProps> = ({
  showSearch = false,
  showFilters = true,
  showSort = true,
  showReset = true,
  filtersConfig = [],
  filters,
  setFilters,
  sortOptions = [],
  sort = {},
  setSort,
  compact = true,
}) => {
  // 🧩 Handlers
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({ ...filters, search: e.target.value });
    },
    [filters, setFilters]
  );

  const handleFiltersChange = useCallback(
    (newFilters: FiltersObject) => setFilters({ ...filters, ...newFilters }),
    [filters, setFilters]
  );

  const selectedSort = useMemo(
    () =>
      sortOptions.find((opt) => opt.field === sort.field) ?? null,
    [sortOptions, sort.field]
  );

  const handleSortField = useCallback(
    (opt: Option) =>
      setSort?.({ field: opt.value as string, order: sort.order ?? "asc" }),
    [setSort, sort.order]
  );

  const toggleSortOrder = useCallback(() => {
    if (!setSort) return;
    const nextOrder = sort.order === "asc" ? "desc" : "asc";
    setSort({ field: sort.field ?? "", order: nextOrder });
  }, [sort, setSort]);

  const handleReset = useCallback(() => {
    setFilters({});
    setSort?.({
      field: sortOptions[0]?.field ?? "createdAt",
      order: "desc",
    });
  }, [setFilters, setSort, sortOptions]);

  return (
    <div
      className={`w-full flex flex-col gap-3 bg-surface px-3 py-1 rounded-xl ${
        compact ? "md:flex-row md:items-end md:justify-between" : ""
      }`}
    >
      <div className="flex-1 flex flex-col gap-3 w-full">
        {showSearch && (
          <AppInput
            placeholder="Search..."
            value={(filters.search as string) ?? ""}
            onChange={handleSearch}
            prefixIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="max-w-sm"
          />
        )}

        {showFilters && filtersConfig.length > 0 && (
          <FilterPanel
            filters={filters ?? {}}
            onChange={handleFiltersChange}
            fields={filtersConfig}
          />
        )}
      </div>

      {(showSort || showReset) && (
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {showSort && sortOptions.length > 0 && (
            <>
              <AppSelect
                placeholder="Sort by..."
                options={sortOptions.map((s) => ({
                  label: s.label,
                  value: s.field,
                }))}
                value={
                  selectedSort
                    ? {
                        label: selectedSort.label,
                        value: selectedSort.field,
                      }
                    : undefined
                }
                onChange={handleSortField}
                className="min-w-40"
              />

              {sort.field && (
                <AppButton
                  variant="ghost"
                  size="sm"
                  onClick={toggleSortOrder}
                  aria-label="Toggle sort order"
                >
                  <ArrowUpDown
                    className={`h-4 w-4 transition-transform ${
                      sort.order === "desc" ? "rotate-180" : ""
                    }`}
                  />
                </AppButton>
              )}
            </>
          )}

          {showReset && (
            <AppButton
              variant="ghost"
              size="sm"
              onClick={handleReset}
              title="Reset all"
            >
              <X className="h-4 w-4" />
            </AppButton>
          )}
        </div>
      )}
    </div>
  );
};
