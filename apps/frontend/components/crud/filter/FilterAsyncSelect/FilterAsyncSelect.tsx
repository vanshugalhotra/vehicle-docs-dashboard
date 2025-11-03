"use client";

import React, { FC, useCallback } from "react";
import { AppAsyncSelect } from "@/components/ui/AppSelect/AppAsyncSelect";
import { FilterConfig } from "@/lib/types/filter.types";

interface FilterAsyncSelectProps {
  config: FilterConfig;
  value?: string;
  onChange: (val: string | null) => void;
  onClear?: () => void;
  error?: string;
  disabled?: boolean;
  dependencyValue?: string; // used when dependsOn is configured
}

/**
 * FilterAsyncSelect — wraps AppAsyncSelect with filter-specific normalization.
 * It handles dependency changes (e.g., category → type), null value clearing, and normalization.
 */
export const FilterAsyncSelect: FC<FilterAsyncSelectProps> = ({
  config,
  value,
  onChange,
  onClear,
  error,
  disabled = false,
  dependencyValue,
}) => {
  const handleChange = useCallback(
    (val: string) => {
      if (!val) onClear?.();
      else onChange(val);
    },
    [onChange, onClear]
  );

  // Build filterBy param if dependency exists
  const filterBy =
    config.dependsOn && dependencyValue
      ? { key: config.dependsOn.key, value: dependencyValue }
      : undefined;

  return (
    <div className="w-full">
      <AppAsyncSelect
        endpoint={config.asyncSource!}
        label={config.label}
        placeholder={config.placeholder}
        value={value ?? ""}
        onChange={handleChange}
        filterBy={filterBy}
        transform={config.transform}
        disabled={disabled}
        error={error}
        className="w-full"
      />
    </div>
  );
};
