"use client";

import { useEffect, useMemo, useState } from "react";
import { AppSelect, type Option } from "@/components/ui/AppSelect";
import { debounce } from "@/lib/utils/debounce";

/**
 * FilterSelect
 * - Wraps AppSelect for use in filters
 * - Adds debounced onChange
 * - Syncs external + local state
 * - Optional clear/reset
 */
export interface FilterSelectProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  helperText?: string;
  clearable?: boolean;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value = "",
  onChange,
  options,
  placeholder = "Select...",
  debounceMs = 400,
  disabled = false,
  helperText,
  clearable = true,
}) => {
  const [localValue, setLocalValue] = useState<string>(value);

  // Sync external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced update callback
  const debouncedChange = useMemo(
    () =>
      debounce((val: string) => {
        onChange(val);
      }, debounceMs),
    [onChange, debounceMs]
  );

  // Find current Option
  const currentOption = useMemo(
    () => options.find((opt) => opt.value === localValue) || null,
    [localValue, options]
  );

  const handleChange = (opt: Option | null) => {
    const val = opt?.value ?? "";
    setLocalValue(val);
    debouncedChange(val);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className="relative w-full">
      <AppSelect
        label={label}
        options={options}
        value={currentOption ?? undefined}
        onChange={handleChange}
        placeholder={placeholder}
        helperText={helperText}
        disabled={disabled}
        className="w-full"
      />

      {clearable && localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
};
