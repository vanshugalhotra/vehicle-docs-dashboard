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
  /** Config-driven optional elements */
  showSearch?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  showReset?: boolean;

  /** Filter configuration */
  filtersConfig?: FilterConfig[];
  filters: FiltersObject;
  setFilters: (filters: FiltersObject) => void;

  /** Business filters configuration */
  businessFiltersConfig?: FilterConfig[];
  businessFilters?: FiltersObject;
  setBusinessFilters?: (filters: FiltersObject) => void;

  /** Sort configuration */
  sortOptions?: SortOption[];
  sort?: { field?: string; order?: "asc" | "desc" };
  setSort?: (sort: { field?: string; order?: "asc" | "desc" }) => void;

  /** Layout control */
  compact?: boolean;
}

/**
 * Flexible TableToolbar — supports:
 * search, filters, business filters, sort, reset
 */
export const TableToolbar: React.FC<TableToolbarProps> = ({
  showSearch = false,
  showFilters = true,
  showSort = true,
  showReset = true,
  filtersConfig = [],
  filters,
  setFilters,
  businessFiltersConfig = [],
  businessFilters,
  setBusinessFilters,
  sortOptions = [],
  sort = {},
  setSort,
  compact = true,
}) => {
  // -------------------
  // Handlers
  // -------------------
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

  const handleBusinessFiltersChange = useCallback(
    (newFilters: FiltersObject) => {
      const normalized: FiltersObject = {};

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          normalized[key] = value;
        }
      });

      setBusinessFilters?.(normalized);
    },
    [setBusinessFilters]
  );

  const selectedSort = useMemo(
    () => sortOptions.find((opt) => opt.field === sort.field) ?? null,
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
    setBusinessFilters?.({});
    setSort?.({
      field: sortOptions[0]?.field ?? "createdAt",
      order: "desc",
    });
  }, [setFilters, setBusinessFilters, setSort, sortOptions]);

  // -------------------
  // Render
  // -------------------
  return (
    <div
      className={`w-full hover:border-border-hover hover:shadow-md transition-all duration-150 flex flex-col gap-3 bg-surface p-3 border border-border rounded-lg shadow-sm ${
        compact ? "md:flex-row md:items-end md:justify-between" : ""
      }`}
    >
      <div className="flex-1 flex flex-col gap-3 w-full">
        {/* Search */}
        {showSearch && (
          <AppInput
            placeholder="Search..."
            value={(filters.search as string) ?? ""}
            onChange={handleSearch}
            prefixIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="max-w-sm"
          />
        )}

        {/* Normal Filters */}
        {showFilters && filtersConfig.length > 0 && (
          <FilterPanel
            filters={filters ?? {}}
            onChange={handleFiltersChange}
            fields={filtersConfig}
          />
        )}

        {/* Business Filters */}
        {businessFiltersConfig.length > 0 && setBusinessFilters && (
          <FilterPanel
            filters={businessFilters ?? {}}
            onChange={handleBusinessFiltersChange}
            fields={businessFiltersConfig}
          />
        )}
      </div>

      {/* Sort + Reset */}
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
                    ? { label: selectedSort.label, value: selectedSort.field }
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
