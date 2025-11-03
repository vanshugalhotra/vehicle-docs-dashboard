"use client";

import React from "react";
import { FilterConfig, FiltersObject } from "@/lib/types/filter.types";
import { FilterTextInput } from "./FilterTextInput/FilterTextInput";
import { FilterSelect } from "./FilterSelect/FilterSelect";
import { FilterAsyncSelect } from "./FilterAsyncSelect/FilterAsyncSelect";
import { FilterDateRange } from "./FilterDateRange/FilterDateRange";

interface FilterRendererProps {
  config: FilterConfig;
  filters: FiltersObject;
  onChange: (key: string, value: unknown) => void;
}

export const FilterRenderer: React.FC<FilterRendererProps> = ({
  config,
  filters,
  onChange,
}) => {
  const value = filters[config.key];

  switch (config.type) {
    case "text":
      return (
        <FilterTextInput
          label={config.label}
          placeholder={config.placeholder}
          value={(value as string) ?? ""}
          onChange={(v) => onChange(config.key, v)}
        />
      );

    case "select":
      return (
        <FilterSelect
          label={config.label}
          placeholder={config.placeholder}
          options={config.options ?? []}
          value={(value as string) ?? ""}
          onChange={(v) => onChange(config.key, v)}
        />
      );

    case "async-select":
      return (
        <FilterAsyncSelect
          config={config}
          value={(value as string) ?? ""}
          onChange={(v) => onChange(config.key, v)}
        />
      );

    case "dateRange": {
      const range = value as
        | { gte?: string | number; lte?: string | number }
        | undefined;

      return (
        <FilterDateRange
          label={config.label}
          start={range?.gte ? String(range.gte) : undefined}
          end={range?.lte ? String(range.lte) : undefined}
          onChange={(v) => onChange(config.key, v)}
        />
      );
    }

    default:
      return null;
  }
};
