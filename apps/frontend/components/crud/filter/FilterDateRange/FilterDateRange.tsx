"use client";

import { useEffect, useMemo, useState } from "react";
import { AppDatePicker } from "@/components/ui/AppDatePicker";
import { debounce } from "@/lib/utils/debounce";

/**
 * FilterDateRange
 * - Sends just the range object { gte?: string; lte?: string }
 * - The parent component should assign it to the correct field name
 */
export interface FilterDateRangeProps {
  label?: string;
  start?: string | null; // ISO string
  end?: string | null; // ISO string
  onChange: (range: { gte?: string; lte?: string } | null) => void; // Changed this line
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
      debounce((range: { gte?: string; lte?: string } | null) => { // Changed this line
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

  // Convert date to backend-compatible format (start of day for gte, end of day for lte)
  const normalizeDateForBackend = (date: Date, isEndDate: boolean = false): string => {
    if (isEndDate) {
      // For end date, set to end of day
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay.toISOString();
    }
    // For start date, set to start of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay.toISOString();
  };

  // Build the range filter object
  const buildRangeFilter = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate && !endDate) {
      return null;
    }

    const rangeFilter: { gte?: string; lte?: string } = {};

    if (startDate) {
      rangeFilter.gte = normalizeDateForBackend(startDate, false);
    }

    if (endDate) {
      rangeFilter.lte = normalizeDateForBackend(endDate, true);
    }

    return rangeFilter;
  };

  // Local handlers
  const handleStartChange = (date: Date | null) => {
    setLocalStart(date);
    const rangeFilter = buildRangeFilter(date, localEnd);
    debouncedChange(rangeFilter);
  };

  const handleEndChange = (date: Date | null) => {
    setLocalEnd(date);
    const rangeFilter = buildRangeFilter(localStart, date);
    debouncedChange(rangeFilter);
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
      </div>

      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
};