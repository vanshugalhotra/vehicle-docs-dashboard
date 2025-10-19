"use client";
import React, { FC, InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { theme, radius, transition } from "../../tokens/designTokens";
import { AppText } from "../AppText";

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}

export const AppInput: FC<AppInputProps> = ({
  label,
  error,
  helperText,
  prefixIcon,
  suffixIcon,
  disabled = false,
  className,
  ...props
}) => {
  const t = theme.light; // focus on light mode first

  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <AppText as="label" size="label" className={t.colors.textSecondary}>
          {label}
        </AppText>
      )}

      <div
        className={clsx(
          "relative flex items-center w-full",
          disabled && t.colors.disabledOpacity
        )}
      >
        {prefixIcon && (
          <span className="absolute left-3 flex items-center text-gray-400">
            {prefixIcon}
          </span>
        )}

        <input
          className={clsx(
            "w-full px-3 py-2",
            transition.base,
            radius.md,
            t.input.base,
            !disabled && t.input.hover,
            error
              ? t.input.error
              : !disabled
              ? t.input.focus
              : t.input.disabled,
            prefixIcon && "pl-10",
            suffixIcon && "pr-10",
            disabled && t.input.disabled,
            className
          )}
          disabled={disabled}
          {...props}
        />

        {suffixIcon && (
          <span className="absolute right-3 flex items-center text-gray-400">
            {suffixIcon}
          </span>
        )}
      </div>

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
