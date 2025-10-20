"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

interface AppBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const AppBadge: FC<AppBadgeProps> = ({
  children,
  variant = "neutral",
  className,
}) => {
  const variantClasses: Record<BadgeVariant, string> = {
    neutral: componentTokens.badge.neutral,
    success: componentTokens.badge.success,
    warning: componentTokens.badge.warning,
    danger: componentTokens.badge.danger,
    info: componentTokens.badge.info,
  };

  return (
    <span
      className={clsx(
        "inline-block select-none transition-all duration-150",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};