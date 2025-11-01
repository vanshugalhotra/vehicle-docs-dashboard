"use client";

import { useEffect, useMemo, useState } from "react";
import { AppDatePicker } from "@/components/ui/AppDatePicker";
import { debounce } from "@/lib/utils/debounce";

/**
 * FilterDateRange
 * - Wraps AppDatePicker twice (start & end)
 * - Debounced filter updates
 * - Syncs with external values
 * - Designed for list filtering (not forms)
 */
export interface FilterDateRangeProps {
  label?: string;
  start?: string | null; // ISO string
  end?: string | null; // ISO string
  onChange: (range: { start?: string | null; end?: string | null }) => void;
  debounceMs?: number;
  disabled?: boolean;
  helperText?: string;
  clearable?: boolean;
}

export const FilterDateRange: React.FC<FilterDateRangeProps> = ({
  label,
  start = null,
  end = null,
  onChange,
  debounceMs = 400,
  disabled = false,
  helperText,
  clearable = true,
}) => {
  const [localStart, setLocalStart] = useState<Date | null>(
    start ? new Date(start) : null
  );
  const [localEnd, setLocalEnd] = useState<Date | null>(
    end ? new Date(end) : null
  );

  // Debounced onChange
  const debouncedChange = useMemo(
    () =>
      debounce((range: { start?: string | null; end?: string | null }) => {
        onChange(range);
      }, debounceMs),
    [onChange, debounceMs]
  );

  // Sync external → local
  useEffect(() => {
    setLocalStart(start ? new Date(start) : null);
  }, [start]);

  useEffect(() => {
    setLocalEnd(end ? new Date(end) : null);
  }, [end]);

  // Local handlers
  const handleStartChange = (date: Date | null) => {
    setLocalStart(date);
    debouncedChange({
      start: date ? date.toISOString() : null,
      end: localEnd ? localEnd.toISOString() : null,
    });
  };

  const handleEndChange = (date: Date | null) => {
    setLocalEnd(date);
    debouncedChange({
      start: localStart ? localStart.toISOString() : null,
      end: date ? date.toISOString() : null,
    });
  };

  const handleClear = () => {
    setLocalStart(null);
    setLocalEnd(null);
    onChange({ start: null, end: null });
  };

  return (
    <div className="flex flex-col w-full gap-2">
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}

      <div className="flex gap-2 items-center">
        <AppDatePicker
          label="Start"
          value={localStart}
          onChange={handleStartChange}
          disabled={disabled}
        />
        <AppDatePicker
          label="End"
          value={localEnd}
          onChange={handleEndChange}
          disabled={disabled}
        />

        {clearable && (localStart || localEnd) && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors mt-6"
          >
            ✕
          </button>
        )}
      </div>

      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
};
