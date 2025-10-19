"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { theme, ThemeType } from "../../tokens/designTokens";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger";

interface AppBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  themeType?: ThemeType;
}

export const AppBadge: FC<AppBadgeProps> = ({
  children,
  variant = "neutral",
  className,
  themeType = "light",
}) => {
  const themeColors = theme[themeType].colors;

  const variantClasses: Record<BadgeVariant, string> = {
    neutral: themeColors.neutralBadge,
    success: themeColors.successBadge,
    warning: themeColors.warningBadge,
    danger: themeColors.dangerBadge,
  };

  return (
    <span
      className={clsx(
        "inline-block text-sm font-medium px-2 py-1 select-none",
        theme[themeType].radius.sm,
        theme[themeType].transition.base,
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
