"use client";
import React, { ButtonHTMLAttributes, FC, ReactNode } from "react";
import clsx from "clsx";
import { theme, ThemeType } from "../../tokens/designTokens";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "link";
type ButtonSize = "sm" | "md" | "lg";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  themeType?: ThemeType; // allow dynamic theme switching
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-lg",
};

export const AppButton: FC<AppButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  themeType = "light",
  children,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const themeColors = theme[themeType].colors;

  const variantClasses: Record<ButtonVariant, string> = {
    primary: themeColors.primary,
    secondary: themeColors.secondary,
    outline: themeColors.outline,
    ghost: themeColors.ghost,
    danger: themeColors.danger,
    link: themeColors.link,
  };

  return (
    <button
      disabled={isDisabled}
      className={clsx(
        "inline-flex items-center justify-center font-medium gap-2 select-none",
        theme[themeType].radius.md,
        theme[themeType].transition.base,
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && themeColors.disabledOpacity,
        loading && "opacity-70 cursor-wait"
      )}
      {...props}
    >
      {loading && (
        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
      )}
      {!loading && startIcon}
      {!loading && children}
      {!loading && endIcon}
    </button>
  );
};
