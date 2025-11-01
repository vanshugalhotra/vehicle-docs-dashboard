"use client";

import { useEffect, useState, useMemo } from "react";
import { AppInput } from "@/components/ui/AppInput";
import { debounce } from "@/lib/utils/debounce";

export interface FilterTextInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  helperText?: string;
}

/**
 * FilterTextInput
 * - Reuses AppInput
 * - Debounces user input using shared lib/utils/debounce
 * - Keeps local value synced with external updates
 */
export const FilterTextInput: React.FC<FilterTextInputProps> = ({
  label,
  value = "",
  onChange,
  placeholder,
  debounceMs = 400,
  disabled = false,
  helperText,
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Keep local state in sync with parent
  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  // Memoize debounced handler
  const debouncedOnChange = useMemo(
    () => debounce((val: string) => onChange(val), debounceMs),
    [onChange, debounceMs]
  );

  return (
    <AppInput
      label={label}
      value={localValue}
      placeholder={placeholder}
      onChange={(e) => {
        const val = e.target.value;
        setLocalValue(val);
        debouncedOnChange(val.trim());
      }}
      disabled={disabled}
      helperText={helperText}
    />
  );
};
