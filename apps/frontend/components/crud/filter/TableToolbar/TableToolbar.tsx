"use client";

import React, { useCallback, useMemo } from "react";
import { Search, ArrowUpDown, X } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppSelect, Option } from "@/components/ui/AppSelect";
import { AppInput } from "@/components/ui/AppInput";
import { FilterPanel } from "../FilterPanel/FilterPanel";
import type {
  FilterConfig,
  SortOption,
  FiltersObject,
} from "@/lib/types/filter.types";
import { useQueryOptions } from "@/hooks/useQueryOptions";

interface TableToolbarProps {
  filtersConfig: FilterConfig[];
  sortOptions: SortOption[];
  onChange?: (
    query: ReturnType<typeof useQueryOptions>["queryOptions"]
  ) => void;
  compact?: boolean;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  filtersConfig,
  sortOptions,
  onChange,
  compact = true,
}) => {
  const { queryOptions, setFilters, setSort, setSearch, resetAll, filters} =
    useQueryOptions({
      search: "",
      filters: {},
      sort: { field: sortOptions[0]?.field ?? "createdAt", order: "desc" },
    });

  // Emit updates upward
  React.useEffect(() => {
    onChange?.(queryOptions);
  }, [queryOptions, onChange]);

  // Filters
  const handleFiltersChange = useCallback(
    (filters: FiltersObject) => setFilters(filters),
    [setFilters]
  );

  // Sort
  const selectedSort = useMemo(
    () => sortOptions.find((opt) => opt.field === queryOptions.sortBy) ?? null,
    [sortOptions, queryOptions.sortBy]
  );

  const handleSortField = useCallback(
    (opt: Option) => setSort(opt.value as string, queryOptions.order ?? "asc"),
    [setSort, queryOptions.order]
  );

  const toggleSortOrder = useCallback(() => {
    const nextOrder = queryOptions.order === "asc" ? "desc" : "asc";
    setSort(queryOptions.sortBy ?? "", nextOrder);
  }, [queryOptions, setSort]);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    [setSearch]
  );

  return (
    <div
      className={`w-full flex flex-col gap-3 border border-border-subtle bg-surface p-3 rounded-xl ${
        compact ? "md:flex-row md:items-end md:justify-between" : ""
      }`}
    >
      {/* 🔎 Search + Filters */}
      <div className="flex-1 flex flex-col gap-3">
        <AppInput
          placeholder="Search..."
          value={queryOptions.search ?? ""}
          onChange={handleSearch}
          prefixIcon={<Search className="h-4 w-4 text-muted-foreground" />}
          className="max-w-sm"
        />

        {filtersConfig.length > 0 && (
          <FilterPanel
            filters={filters ?? {}}
            onChange={handleFiltersChange}
            fields={filtersConfig}
          />
        )}
      </div>

      {/* ⚙️ Sort + Actions */}
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <AppSelect
          placeholder="Sort by..."
          options={sortOptions.map((s) => ({ label: s.label, value: s.field }))}
          value={
            selectedSort
              ? { label: selectedSort.label, value: selectedSort.field }
              : undefined
          }
          onChange={handleSortField}
          className="min-w-40"
        />

        {queryOptions.sortBy && (
          <AppButton
            variant="ghost"
            size="sm"
            onClick={toggleSortOrder}
            aria-label="Toggle sort order"
          >
            <ArrowUpDown
              className={`h-4 w-4 transition-transform ${
                queryOptions.order === "desc" ? "rotate-180" : ""
              }`}
            />
          </AppButton>
        )}

        <AppButton
          variant="ghost"
          size="sm"
          onClick={resetAll}
          title="Reset all"
        >
          <X className="h-4 w-4" />
        </AppButton>
      </div>
    </div>
  );
};
