"use client";
import React, {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  Ref,
} from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppText } from "../AppText";

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      label,
      error,
      helperText,
      prefixIcon,
      suffixIcon,
      disabled = false,
      className,
      ...props
    },
    ref: Ref<HTMLInputElement>
  ) => {
    return (
      <div className="flex flex-col w-full gap-1">
        {label && (
          <AppText
            as="label"
            size="label"
            className={componentTokens.text.secondary}
          >
            {label}
          </AppText>
        )}

        <div className="relative flex items-center w-full">
          {prefixIcon && (
            <span className={clsx(componentTokens.input.icon, "left-7")}>
              {prefixIcon}
            </span>
          )}

          <input
            ref={ref}
            className={clsx(
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
            <span className={clsx(componentTokens.input.icon, "right-7")}>
              {suffixIcon}
            </span>
          )}
        </div>

        {error ? (
          <AppText
            size="caption"
            className={componentTokens.text.error}
            variant="error"
          >
            {error}
          </AppText>
        ) : (
          helperText && (
            <AppText
              size="caption"
              className={componentTokens.text.bodySecondary}
            >
              {helperText}
            </AppText>
          )
        )}
      </div>
    );
  }
);

AppInput.displayName = "AppInput";
