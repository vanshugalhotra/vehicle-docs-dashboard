"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AppText } from "@/components/ui/AppText";
import { CalendarIcon } from "lucide-react";
import { componentTokens } from "@/styles/design-system";
import { debounce } from "@/lib/utils/debounce";
import { formatShortDate } from "@/lib/utils/dateUtils";

export interface FilterDateRangeProps {
  label?: string;
  hideLabel?: boolean;
  start?: string | null;
  end?: string | null;
  onChange: (range: { gte?: string; lte?: string } | null) => void;
  debounceMs?: number;
  disabled?: boolean;
  helperText?: string;
}

export const FilterDateRange: FC<FilterDateRangeProps> = ({
  label,
  hideLabel = false,
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
  const [open, setOpen] = useState(false);

  // ----------------------
  // Debounced onChange
  // ----------------------
  const debouncedChange = useMemo(
    () =>
      debounce((range: { gte?: string; lte?: string } | null) => onChange(range), debounceMs),
    [onChange, debounceMs]
  );

  // ----------------------
  // Sync props → state
  // ----------------------
  useEffect(() => setLocalStart(start ? new Date(start) : null), [start]);
  useEffect(() => setLocalEnd(end ? new Date(end) : null), [end]);

  // ----------------------
  // Normalize to start/end of day
  // ----------------------
  const normalizeDate = (date: Date, isEnd = false) => {
    const d = new Date(date);
    if (isEnd) d.setHours(23, 59, 59, 999);
    else d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const handleChange = (startDate: Date | null, endDate: Date | null) => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
    debouncedChange(
      startDate || endDate
        ? { gte: startDate ? normalizeDate(startDate) : undefined, lte: endDate ? normalizeDate(endDate, true) : undefined }
        : null
    );
  };

  const handleRangeChange = (dates: [Date | null, Date | null] | null) => {
    const [startDate, endDate] = Array.isArray(dates) ? dates : [dates, null];
    handleChange(startDate, endDate);
  };

  const handleClear = () => handleChange(null, null);

  // ----------------------
  // Format input display
  // ----------------------
  const formatRange = (start?: Date | null, end?: Date | null) => {
    if (!start && !end) return "";
    if (!start) return `- ${formatShortDate(end)}`;
    if (!end) return `${formatShortDate(start)} -`;
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
  };

  const hasSelection = localStart || localEnd;

  return (
    <div className="flex flex-col w-full gap-2 relative">
      {!hideLabel && label && (
        <AppText size="label" className={componentTokens.text.primary}>
          {label}
        </AppText>
      )}

      <div className={clsx("relative w-full", disabled && "opacity-50 pointer-events-none")}>
        <div className="relative flex items-center w-full">
          <input
            type="text"
            readOnly
            className={clsx(
              componentTokens.input.base,
              !disabled && componentTokens.input.focus,
              "w-full",
              hasSelection ? "text-gray-900" : "text-gray-500"
            )}
            placeholder="Select date range"
            value={formatRange(localStart, localEnd)}
            onClick={() => !disabled && setOpen((o) => !o)}
            aria-label={label || "Date range picker"}
          />
          <CalendarIcon
            className="absolute right-2 w-4 h-4 text-gray-500 cursor-pointer"
            onClick={() => !disabled && setOpen((o) => !o)}
            aria-hidden="true"
          />
        </div>

        {open && (
          <div className="absolute z-50 mt-1 w-[280px] bg-white border rounded-lg shadow-xl p-2">
            <ReactDatePicker
              selected={localStart}
              onChange={handleRangeChange}
              selectsRange
              startDate={localStart}
              endDate={localEnd}
              inline
              showPopperArrow={false}
              calendarClassName="w-full"
              dateFormat="dd/MM/yyyy"
              shouldCloseOnSelect={false}
            />
            <div className="flex justify-center space-x-2 pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
};
