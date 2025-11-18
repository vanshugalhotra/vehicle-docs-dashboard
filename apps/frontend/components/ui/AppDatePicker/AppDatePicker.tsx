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
  hideLabel?: boolean;
  helperText?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const AppDatePicker: FC<AppDatePickerProps> = ({
  value,
  onChange,
  label,
  hideLabel = false, // default false
  error,
  placeholder = "Select date...",
  disabled = false,
  className,
}) => {
  return (
    <div className="flex flex-col w-full gap-1">
      {label && !hideLabel && (
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
          !disabled && componentTokens.input.focus,
          className
        )}
        wrapperClassName="w-full"
        dateFormat="dd/MM/yyyy"
      />
    </div>
  );
};
