"use client";

import React, { useState, useCallback, useMemo } from "react";
import clsx from "clsx";
import { AppButton } from "@/components/ui/AppButton";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppCard } from "@/components/ui/AppCard";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { componentTokens } from "@/styles/design-system/componentTokens";
import type {
  FilterSortBarProps,
  FiltersObject,
  SortState,
} from "@/lib/types/filter.types";
import { FilterPanel } from "@/components/crud/filter/FilterPanel/FilterPanel";

export const FilterSortBar: React.FC<FilterSortBarProps> = ({
  filtersConfig,
  sortOptions,
  initialState,
  autoApply = true,
  onChange,
}) => {
  /** ------------------------------
   *  STATE
   *  ------------------------------ */
  const [filters, setFilters] = useState<FiltersObject>(
    initialState?.filters ?? {}
  );

  // Fixed: Properly handle initial sort state
  const [sort, setSort] = useState<SortState>(() => {
    // Use initial state if provided
    if (initialState?.sort) {
      return initialState.sort;
    }

    // Find default sort option and convert to SortState
    const defaultSortOption = sortOptions.find((s) => s.default);
    if (defaultSortOption) {
      return {
        field: defaultSortOption.field,
        order: "asc",
      };
    }

    // Fallback to first option or empty
    return {
      field: sortOptions[0]?.field ?? "",
      order: "asc",
    };
  });

  const [expanded, setExpanded] = useState(false);

  /** ------------------------------
   *  HANDLERS
   *  ------------------------------ */
  const handleFiltersChange = useCallback(
    (next: FiltersObject) => {
      setFilters(next);
      if (autoApply && onChange) onChange({ filters: next, sort });
    },
    [autoApply, onChange, sort]
  );

  const handleResetFilters = useCallback(() => {
    setFilters({});
    onChange?.({ filters: {}, sort });
  }, [onChange, sort]);

  const handleSortFieldChange = useCallback(
    (val: string) => {
      const next: SortState = { ...sort, field: val };
      setSort(next);
      onChange?.({ filters, sort: next });
    },
    [sort, filters, onChange]
  );

  const handleSortOrderToggle = useCallback(() => {
    const next: SortState = {
      ...sort,
      order: sort.order === "asc" ? "desc" : "asc",
    };
    setSort(next);
    onChange?.({ filters, sort: next });
  }, [sort, filters, onChange]);

  const toggleExpand = useCallback(() => {
    setExpanded((p) => !p);
  }, []);

  /** ------------------------------
   *  MEMOIZED VALUES
   *  ------------------------------ */
  const sortFieldOptions = useMemo(
    () =>
      sortOptions.map((s) => ({
        label: s.label,
        value: s.field,
      })),
    [sortOptions]
  );

  /** ------------------------------
   *  RENDER
   *  ------------------------------ */
  return (
    <AppCard className={componentTokens.card.base}>
      {/* Top Bar: Sort + Actions */}
      <div className={clsx(componentTokens.layout.pageHeader, "flex-wrap")}>
        <div className="flex items-center gap-2 flex-wrap">
          <AppSelect
            label="Sort by"
            value={sortFieldOptions.find((o) => o.value === sort.field)}
            onChange={(opt) => handleSortFieldChange(opt?.value ?? "")}
            options={sortFieldOptions}
            className="min-w-[140px] w-full sm:w-auto"
          />

          <AppButton
            variant="outline"
            size="sm"
            onClick={handleSortOrderToggle}
            className="flex items-center gap-1"
          >
            {sort.order === "asc" ? (
              <>
                <ChevronUp className="w-4 h-4" /> Asc
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Desc
              </>
            )}
          </AppButton>

          <AppButton
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-text-tertiary"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </AppButton>
        </div>

        {filtersConfig.length > 0 && (
          <AppButton
            variant="secondary"
            size="sm"
            onClick={toggleExpand}
            className="ml-auto shrink-0"
          >
            {expanded ? "Hide Filters" : "Show Filters"}
          </AppButton>
        )}
      </div>

      {/* Filters Panel */}
      {expanded && (
        <div className="border-t border-border-subtle pt-4">
          <FilterPanel
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
            fields={filtersConfig}
            compact
          />
        </div>
      )}
    </AppCard>
  );
};
