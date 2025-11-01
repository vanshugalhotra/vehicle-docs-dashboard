"use client";

import React from "react";
import { FiltersObject, FilterConfig } from "@/lib/types/filter.types";
import { FilterTextInput } from "./FilterTextInput/FilterTextInput";
import { FilterSelect } from "./FilterSelect/FilterSelect";
import { FilterAsyncSelect } from "./FilterAsyncSelect/FilterAsyncSelect";
import { FilterDateRange } from "./FilterDateRange/FilterDateRange";

/**
 * FilterRenderer
 * - Decides which filter component to render based on config.type
 * - Uses layout hints (ui.compact, ui.width, ui.columnSpan)
 */
interface FilterRendererProps {
  config: FilterConfig;
  filters: FiltersObject;
  onChange: (key: string, value: unknown) => void;
  debounceMs?: number;
  dependencyValue?: string;
  dense?: boolean;
}

export const FilterRenderer: React.FC<FilterRendererProps> = ({
  config,
  filters,
  onChange,
  debounceMs = 400,
  dependencyValue,
  dense = false,
}) => {
  const value = filters[config.key];
  const isCompact = dense || config.ui?.compact;

  const commonProps = {
    label: config.label,
    placeholder: config.placeholder,
    dense: isCompact,
  };

  const wrapperStyle: React.CSSProperties = {
    width:
      typeof config.ui?.width === "number"
        ? `${config.ui.width}px`
        : config.ui?.width,
    gridColumn: config.ui?.columnSpan
      ? `span ${config.ui.columnSpan} / span ${config.ui.columnSpan}`
      : undefined,
  };

  switch (config.type) {
    case "text":
      return (
        <div style={wrapperStyle}>
          <FilterTextInput
            {...commonProps}
            value={String(value ?? "")}
            onChange={(val) => onChange(config.key, val)}
            debounceMs={debounceMs}
          />
        </div>
      );

    case "select":
      return (
        <div style={wrapperStyle}>
          <FilterSelect
            {...commonProps}
            value={String(value ?? "")}
            options={config.options ?? []}
            onChange={(val) => onChange(config.key, val)}
            debounceMs={debounceMs}
          />
        </div>
      );

    case "async-select":
      return (
        <div style={wrapperStyle}>
          <FilterAsyncSelect
            config={config}
            value={String(value ?? "")}
            onChange={(val) => onChange(config.key, val)}
            dependencyValue={dependencyValue}
          />
        </div>
      );

    case "dateRange":
      let dateRangeValue: { start?: string | null; end?: string | null } = {};
      if (typeof value === "object" && value && !Array.isArray(value)) {
        const val = value as Record<string, unknown>;
        dateRangeValue = {
          start: typeof val.start === "string" ? val.start : null,
          end: typeof val.end === "string" ? val.end : null,
        };
      }

      return (
        <div style={wrapperStyle}>
          <FilterDateRange
            {...commonProps}
            start={dateRangeValue.start}
            end={dateRangeValue.end}
            onChange={(range) => onChange(config.key, range)}
            debounceMs={debounceMs}
          />
        </div>
      );

    default:
      return null;
  }
};
