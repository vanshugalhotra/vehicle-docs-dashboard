"use client";

import React, { useCallback } from "react";
import {
  FilterConfig,
  FiltersObject,
  FilterValue,
} from "@/lib/types/filter.types";
import { FilterRenderer } from "../FilterRenderer";

interface FilterPanelProps {
  filters: FiltersObject;
  onChange: (filters: FiltersObject) => void;
  fields: FilterConfig[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  fields,
}) => {
  const handleChange = useCallback(
    (key: string, value: unknown) => {
      const next: FiltersObject = { ...filters };
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete next[key];
      } else {
        next[key] = value as FilterValue;
      }
      onChange(next);
    },
    [filters, onChange]
  );

  return (
    <div className="grid w-full gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {fields.map((config) => (
        <FilterRenderer
          key={`${config.key}:${config.label}`}
          config={config}
          filters={filters}
          onChange={handleChange}
        />
      ))}
    </div>
  );
};
