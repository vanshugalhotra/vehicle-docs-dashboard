"use client";

import React from "react";
import { FiltersObject, FilterConfig } from "@/lib/types/filter.types";
import { FilterTextInput } from "./FilterTextInput/FilterTextInput";
import { FilterSelect } from "./FilterSelect/FilterSelect";
import { FilterAsyncSelect } from "./FilterAsyncSelect/FilterAsyncSelect";
import { FilterNumberRange } from "./FilterNumberRange/FilterNumberRange";
import { FilterDateRange } from "./FilterDateRange/FilterDateRange";

/**
 * FilterRenderer
 * - Decides which filter component to render based on config.type
 * - Provides normalized value and handlers
 * - Keeps external FilterPanel clean and declarative
 */

interface FilterRendererProps {
  config: FilterConfig;
  filters: FiltersObject;
  onChange: (key: string, value: unknown) => void;
  debounceMs?: number;
  dependencyValue?: string;
}

export const FilterRenderer: React.FC<FilterRendererProps> = ({
  config,
  filters,
  onChange,
  debounceMs = 400,
  dependencyValue,
}) => {
  const value = filters[config.key];

  switch (config.type) {
    case "text":
      return (
        <FilterTextInput
          label={config.label}
          value={String(value ?? "")}
          placeholder={config.placeholder}
          onChange={(val) => onChange(config.key, val)}
          debounceMs={debounceMs}
        />
      );

    case "select":
      return (
        <FilterSelect
          label={config.label}
          value={String(value ?? "")}
          options={config.options ?? []}
          placeholder={config.placeholder}
          onChange={(val) => onChange(config.key, val)}
          debounceMs={debounceMs}
        />
      );

    case "async-select":
      return (
        <FilterAsyncSelect
          config={config}
          value={String(value ?? "")}
          onChange={(val) => onChange(config.key, val)}
          dependencyValue={dependencyValue}
        />
      );

    case "numberRange":
      return (
        <FilterNumberRange
          label={config.label}
          value={
            typeof value === "object" && value !== null
              ? (value as { min?: number; max?: number })
              : {}
          }
          onChange={(range) => onChange(config.key, range)}
        />
      );

    case "dateRange":
      let dateRangeValue: { start?: string | null; end?: string | null } = {};

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const val = value as Record<string, unknown>;
        dateRangeValue = {
          start: typeof val.start === "string" ? val.start : null,
          end: typeof val.end === "string" ? val.end : null,
        };
      }

      return (
        <FilterDateRange
          label={config.label}
          start={dateRangeValue.start}
          end={dateRangeValue.end}
          onChange={(range) => onChange(config.key, range)}
          debounceMs={debounceMs}
        />
      );

    default:
      return null;
  }
};
