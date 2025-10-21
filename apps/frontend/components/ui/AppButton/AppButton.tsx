"use client";
import React, { ButtonHTMLAttributes, FC, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";

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
}

const sizeClasses: Record<ButtonSize, string> = componentTokens.button.sizes;

export const AppButton: FC<AppButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  children,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={clsx(
        "inline-flex items-center justify-center font-medium gap-2 select-none rounded-md transition-all duration-150",
        componentTokens.button[variant],
        sizeClasses[size],
        isDisabled && componentTokens.button.disabled,
        loading && "cursor-wait"
      )}
      {...props}
    >
      {loading && (
        <span className="animate-spin border-2 border-current border-t-transparent rounded-full w-4 h-4" />
      )}
      {!loading && startIcon}
      {!loading && children}
      {!loading && endIcon}
    </button>
  );
};