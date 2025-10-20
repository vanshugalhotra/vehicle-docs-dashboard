"use client";

import React, { FC } from "react";
import clsx from "clsx";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { componentTokens } from "@/styles/design-system";
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
  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <AppText size="label" className={componentTokens.text.primary}>
          {label}
        </AppText>
      )}

      <ReactDatePicker
        selected={value}
        onChange={onChange}
        placeholderText={placeholder}
        disabled={disabled}
        className={clsx(
          componentTokens.input.base,
          error && componentTokens.input.error,
          disabled && componentTokens.input.disabled,
          !disabled && componentTokens.input.focus // Hover/focus baked in
        )}
        wrapperClassName="w-full"
        dateFormat="dd/MM/yyyy"
      />

      {error ? (
        <AppText size="label" className={componentTokens.text.error} variant="error">
          {error}
        </AppText>
      ) : (
        helperText && (
          <AppText size="label" className={componentTokens.text.bodySecondary}>
            {helperText}
          </AppText>
        )
      )}
    </div>
  );
};