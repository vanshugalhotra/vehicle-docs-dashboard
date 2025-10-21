"use client";
import React, { FC, TextareaHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppText } from "../AppText";

interface AppTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}

export const AppTextArea: FC<AppTextAreaProps> = ({
  label,
  error,
  helperText,
  prefixIcon,
  suffixIcon,
  disabled = false,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <AppText as="label" size="label" className={componentTokens.text.primary}>
          {label}
        </AppText>
      )}

      <div className="relative flex items-start w-full">
        {prefixIcon && (
          <span className={clsx(componentTokens.input.icon, "top-3 left-3")}>
            {prefixIcon}
          </span>
        )}

        <textarea
          className={clsx(
            "w-full px-3 py-2 min-h-[80px] resize-none",
            componentTokens.input.base,
            !disabled && componentTokens.input.focus,
            error && componentTokens.input.error,
            disabled && componentTokens.input.disabled,
            prefixIcon && "pl-10",
            suffixIcon && "pr-10",
            className
          )}
          disabled={disabled}
          {...props}
        />

        {suffixIcon && (
          <span className={clsx(componentTokens.input.icon, "top-3 right-3")}>
            {suffixIcon}
          </span>
        )}
      </div>

      {error ? (
        <AppText size="body" className={componentTokens.text.error}>
          {error}
        </AppText>
      ) : (
        helperText && (
          <AppText size="body" className={componentTokens.text.bodySecondary}>
            {helperText}
          </AppText>
        )
      )}
    </div>
  );
};