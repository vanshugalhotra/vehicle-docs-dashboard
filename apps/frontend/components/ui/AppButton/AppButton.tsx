import React, { ButtonHTMLAttributes, FC } from "react";
import clsx from "clsx";

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
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  outline: "border border-gray-400 text-gray-800 hover:bg-gray-100",
  ghost: "bg-transparent text-gray-800 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  link: "text-blue-600 underline hover:text-blue-700",
};

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
  children,
  ...props
}) => {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200",
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed",
        loading && "opacity-70"
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};
