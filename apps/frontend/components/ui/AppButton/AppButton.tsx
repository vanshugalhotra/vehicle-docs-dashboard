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
  fullWidth?: boolean;
  square?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = componentTokens.button.sizes;

export const AppButton: FC<AppButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  fullWidth = false,
  square = false,
  children,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const hasIconOnly = !children && (startIcon || endIcon);
  const effectiveSize = square ? size : size;

  return (
    <button
      disabled={isDisabled}
      className={clsx(
        "inline-flex items-center justify-center font-medium gap-2 select-none transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed relative overflow-hidden cursor-pointer",
        // Shape & Layout
        "rounded-lg", // Softer corners for modern feel
        fullWidth && "w-full",
        square && "aspect-square p-0",
        // Size & Padding (override for square)
        !square && sizeClasses[effectiveSize],
        square && clsx("p-3", { // Compact for icons
          "w-10 h-10": size === "sm",
          "w-11 h-11": size === "md",
          "w-12 h-12": size === "lg",
        }),
        // Variants & States
        componentTokens.button[variant],
        isDisabled && componentTokens.button.disabled,
        loading && "cursor-wait",
        // Micro-interactions (non-disabled, non-link)
        !isDisabled && variant !== "link" && "hover:brightness-105 active:brightness-95 focus-visible:brightness-105",
        // Ripple support (add class for animation)
        !isDisabled && variant !== "link" && "group [data-ripple]:hidden",
        // Link-specific overrides
        variant === "link" && "px-0 py-0 bg-transparent! border-none! rounded-none gap-1 hover:underline",
        hasIconOnly && "justify-center",
        className
      )}
      aria-busy={loading}
      {...props}
    >
      {/* Ripple Effect Container (for non-link variants) */}
      {!isDisabled && variant !== "link" && (
        <span className="absolute inset-0 pointer-events-none [data-ripple]"></span>
      )}
      {loading && (
        <span 
          className="animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" 
          style={{ width: square ? "1rem" : "1.25rem", height: square ? "1rem" : "1.25rem" }} // Adaptive size
        />
      )}
      {!loading && startIcon && <span className="shrink-0">{startIcon}</span>}
      {!loading && children && (
        <span className={clsx(
          "whitespace-nowrap", // Prevent wrapping for clean lines
          square && "sr-only" // Hide text in square mode for icon-only
        )}>
          {children}
        </span>
      )}
      {!loading && endIcon && <span className="shrink-0">{endIcon}</span>}
    </button>
  );
};