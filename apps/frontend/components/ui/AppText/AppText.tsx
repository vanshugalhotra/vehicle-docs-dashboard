import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { typography, theme } from "../../tokens/designTokens";

interface AppTextProps {
  children: ReactNode;
  size?: keyof typeof typography;
  variant?: "primary" | "secondary" | "muted" | "error" | "success";
  as?: React.ElementType; // e.g. span, p, h1, label, or a component
  className?: string;
}

export const AppText: FC<AppTextProps> = ({
  children,
  size = "md",
  variant = "primary",
  as: Tag = "span",
  className,
}) => {
  const colorClasses = {
    primary: theme.light.colors.textPrimary,
    secondary: theme.light.colors.textSecondary,
    muted: "text-gray-500",
    error: "text-red-600",
    success: "text-green-600",
  };

  return (
    <Tag
      className={clsx(
        typography[size],
        colorClasses[variant],
        "font-normal",
        className
      )}
    >
      {children}
    </Tag>
  );
};
