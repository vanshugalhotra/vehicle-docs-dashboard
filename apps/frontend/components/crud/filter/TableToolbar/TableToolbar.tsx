"use client";

import React, { useCallback, useMemo } from "react";
import { ArrowUpDown, X, Search, Filter } from "lucide-react";
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
    (newFilters: FiltersObject) => {
      const normalized: FiltersObject = {};

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          normalized[key] = value;
        }
      });

      setFilters(normalized);
    },
    [setFilters]
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

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    // Count normal filters (excluding search)
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'search' && value !== "" && value !== null && value !== undefined) {
        count++;
      }
    });
    
    // Count business filters
    if (businessFilters) {
      Object.values(businessFilters).forEach(value => {
        if (value !== "" && value !== null && value !== undefined) {
          count++;
        }
      });
    }
    
    return count;
  }, [filters, businessFilters]);

  const hasActiveFilters = activeFilterCount > 0;

  // -------------------
  // Render
  // -------------------
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Sort & Reset Bar - FIRST */}
      {(showSort || showReset) && (
        <div className="w-full flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-surface p-4 border border-border rounded-lg shadow-sm">
          {/* Left side - Sort controls */}
          {showSort && sortOptions.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpDown className="h-4 w-4" />
                <span className="font-medium">Sort by</span>
              </div>
              
              <AppSelect
                placeholder="Select field..."
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
                className="min-w-48"
              />

              {sort.field && (
                <AppButton
                  variant="outline"
                  size="sm"
                  onClick={toggleSortOrder}
                  aria-label={`Sort ${sort.order === 'asc' ? 'descending' : 'ascending'}`}
                  className="flex items-center gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="capitalize">{sort.order}</span>
                </AppButton>
              )}
            </div>
          )}

          {/* Right side - Reset button */}
          {showReset && (
            <AppButton
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2 sm:ml-auto"
            >
              <X className="h-4 w-4" />
              <span>Reset</span>
            </AppButton>
          )}
        </div>
      )}

      {/* Filters Section - SECOND */}
      {(showFilters && filtersConfig.length > 0) || 
       (businessFiltersConfig.length > 0 && setBusinessFilters) || 
       showSearch ? (
        <div className="w-full flex flex-col gap-4 bg-surface p-4 border border-border rounded-lg shadow-sm">
          {/* Header with filter count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                  {activeFilterCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* Search */}
            {showSearch && (
              <div className="max-w-sm">
                <AppInput
                  placeholder="Search..."
                  value={(filters.search as string) ?? ""}
                  onChange={handleSearch}
                  prefixIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                />
              </div>
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
        </div>
      ) : null}
    </div>
  );
};