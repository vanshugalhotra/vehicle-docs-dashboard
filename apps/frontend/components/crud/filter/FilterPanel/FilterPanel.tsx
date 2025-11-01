"use client";

import React, { useCallback, useMemo } from "react";
import {
  FiltersObject,
  FilterConfig,
  FilterValue,
} from "@/lib/types/filter.types";
import { FilterRenderer } from "../FilterRenderer";
import { mergeFilters } from "@/lib/utils/filterSerializers";

export interface FilterPanelProps {
  filters: FiltersObject;
  onChange: (filters: FiltersObject) => void;
  fields: FilterConfig[];
  debounceMs?: number;
  dense?: boolean;
  isLoading?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  fields,
  debounceMs = 400,
  dense = false,
}) => {
  const handleFilterChange = useCallback(
    (key: string, value: unknown) => {
      const update: FiltersObject = { [key]: value as FilterValue };
      const next = mergeFilters(filters, update);
      onChange(next);
    },
    [filters, onChange]
  );

  const renderedFields = useMemo(
    () =>
      fields.map((config) => {
        const dependencyValue = config.dependsOn
          ? (filters[config.dependsOn.key] as string)
          : undefined;
        return (
          <FilterRenderer
            key={config.key}
            config={config}
            filters={filters}
            onChange={handleFilterChange}
            debounceMs={debounceMs}
            dependencyValue={dependencyValue}
            dense={dense}
          />
        );
      }),
    [fields, filters, handleFilterChange, debounceMs, dense]
  );

  if (dense) {
    return (
      <div className="flex flex-wrap items-center gap-2">{renderedFields}</div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-auto">
      {renderedFields}
    </div>
  );
};
