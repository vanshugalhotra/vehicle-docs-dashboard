"use client";

import React, { useCallback, useMemo } from "react";
import {
  FiltersObject,
  FilterConfig,
  FilterValue,
} from "@/lib/types/filter.types"; // Import FilterValue
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { FilterRenderer } from "../FilterRenderer";
import { mergeFilters } from "@/lib/utils/filterSerializers";
import { componentTokens } from "@/styles/design-system/componentTokens";

export interface FilterPanelProps {
  filters: FiltersObject;
  onChange: (filters: FiltersObject) => void;
  onReset?: () => void;
  fields: FilterConfig[];
  debounceMs?: number;
  compact?: boolean;
  isLoading?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
  fields,
  debounceMs = 400,
  compact = true,
  isLoading = false,
}) => {
  const handleFilterChange = useCallback(
    (key: string, value: unknown) => {
      // Cast the unknown value to FilterValue
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
          />
        );
      }),
    [fields, filters, handleFilterChange, debounceMs]
  );

  return (
    <AppCard className={componentTokens.card.base}>
      <div
        className={
          compact
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : "flex flex-col gap-4"
        }
      >
        {renderedFields}

        {onReset && (
          <div className="flex items-center">
            <AppButton
              variant="secondary"
              size="sm"
              onClick={onReset}
              disabled={isLoading}
            >
              Reset
            </AppButton>
          </div>
        )}
      </div>
    </AppCard>
  );
};
