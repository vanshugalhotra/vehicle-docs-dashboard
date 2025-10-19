"use client";

import React, { FC } from "react";
import clsx from "clsx";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { shadow, radius, transition, theme } from "../../tokens/designTokens";
import { AppText } from "../AppText";

interface AppDatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const AppDatePicker: FC<AppDatePickerProps> = ({
  value,
  onChange,
  label,
  helperText,
  error,
  placeholder = "Select date...",
  disabled = false,
}) => {
  const t = theme.light;

  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <AppText size="label" className={t.colors.textSecondary}>
          {label}
        </AppText>
      )}

      <ReactDatePicker
        selected={value}
        onChange={onChange}
        placeholderText={placeholder}
        disabled={disabled}
        className={clsx(
          "w-full px-3 py-2 border bg-white text-gray-900",
          radius.md,
          shadow.sm,
          transition.base,
          error ? t.colors.errorBorder : t.colors.border,
          disabled && t.colors.disabledOpacity,
          !disabled && "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        )}
        wrapperClassName="w-full"
        dateFormat="dd/MM/yyyy"
      />

      {error ? (
        <AppText size="sm" className="text-red-600">
          {error}
        </AppText>
      ) : (
        helperText && (
          <AppText size="sm" className={t.colors.textSecondary}>
            {helperText}
          </AppText>
        )
      )}
    </div>
  );
};
