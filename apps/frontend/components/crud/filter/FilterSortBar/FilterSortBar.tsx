"use client";

import React, { useCallback, useMemo } from "react";
import { ArrowUpDown, X } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { AppSelect, Option } from "@/components/ui/AppSelect";
import { FilterPanel } from "../FilterPanel/FilterPanel";
import { componentTokens } from "@/styles/design-system/componentTokens";
import type {
  FilterSortBarProps,
  FilterSortState,
  FiltersObject,
} from "@/lib/types/filter.types";

export const FilterSortBar: React.FC<FilterSortBarProps> = ({
  filtersConfig,
  sortOptions,
  initialState,
  mode = "panel",
  autoApply = true,
  onChange,
}) => {
  const [state, setState] = React.useState<FilterSortState>(
    initialState ?? { filters: {}, sort: { field: "", order: "asc" } }
  );

  const isCompact = mode === "compact";

  const handleFiltersChange = useCallback(
    (filters: FiltersObject) => {
      const nextState: FilterSortState = { ...state, filters };
      setState(nextState);
      if (autoApply) onChange?.(nextState);
    },
    [autoApply, state, onChange]
  );

  const handleSortField = useCallback(
    (opt: Option) => {
      const nextState: FilterSortState = {
        ...state,
        sort: { ...state.sort, field: opt.value as string },
      };
      setState(nextState);
      if (autoApply) onChange?.(nextState);
    },
    [autoApply, state, onChange]
  );

  const toggleSortOrder = useCallback(() => {
    const nextOrder = state.sort.order === "asc" ? "desc" : "asc";
    const nextState: FilterSortState = {
      ...state,
      sort: { ...state.sort, order: nextOrder },
    };
    setState(nextState);
    if (autoApply) onChange?.(nextState);
  }, [autoApply, state, onChange]);

  const handleReset = useCallback(() => {
    const resetState: FilterSortState = {
      filters: {},
      sort: { field: "", order: "asc" },
    };
    setState(resetState);
    onChange?.(resetState);
  }, [onChange]);

  const selectedSortOption = useMemo(
    () => sortOptions.find((opt) => opt.field === state.sort.field) ?? null,
    [state.sort.field, sortOptions]
  );

  const compactFilters = useMemo(() => {
    if (isCompact) {
      const visible = filtersConfig.filter((f) => f.ui?.compact);
      return visible.length ? visible : filtersConfig.slice(0, 2);
    }
    return filtersConfig;
  }, [isCompact, filtersConfig]);

  return (
    <div
      className={`
        ${
          isCompact
            ? "flex flex-wrap items-center gap-2"
            : "flex flex-col gap-3 p-3 md:p-4 rounded-lg border border-border-subtle bg-surface"
        }
        ${!isCompact ? componentTokens.card.base : ""}
      `}
    >
      {/* Filters */}
      {compactFilters.length > 0 && (
        <FilterPanel
          filters={state.filters}
          onChange={handleFiltersChange}
          fields={compactFilters}
          dense={isCompact}
        />
      )}

      {/* Sort + Actions */}
      <div
        className={`flex flex-wrap items-center gap-2 ${
          isCompact ? "justify-end flex-1" : "justify-between mt-2"
        }`}
      >
        <div className="flex items-center gap-2">
          <AppSelect
            placeholder="Sort by..."
            options={sortOptions.map((opt) => ({
              label: opt.label,
              value: opt.field,
            }))}
            value={
              selectedSortOption
                ? {
                    label: selectedSortOption.label,
                    value: selectedSortOption.field,
                  }
                : undefined
            }
            onChange={handleSortField}
            className={isCompact ? "min-w-[140px]" : "min-w-[180px]"}
          />

          {state.sort.field && (
            <AppButton
              type="button"
              size="sm"
              variant="ghost"
              onClick={toggleSortOrder}
              aria-label="Toggle sort order"
              title={`Sort ${
                state.sort.order === "asc" ? "ascending" : "descending"
              }`}
            >
              <ArrowUpDown
                className={`h-4 w-4 transition-transform ${
                  state.sort.order === "desc" ? "rotate-180" : ""
                }`}
              />
            </AppButton>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!autoApply && (
            <AppButton
              type="button"
              size="sm"
              variant="primary"
              onClick={() => onChange?.(state)}
            >
              Apply
            </AppButton>
          )}
          <AppButton
            type="button"
            size={isCompact ? "sm" : "md"}
            variant="ghost"
            onClick={handleReset}
            title="Reset filters"
          >
            <X className={`${isCompact ? "h-4 w-4" : "h-4 w-4 mr-1"}`} />
            {!isCompact && "Reset"}
          </AppButton>
        </div>
      </div>
    </div>
  );
};
