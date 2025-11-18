"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

interface AppBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const AppBadge: FC<AppBadgeProps> = ({
  children,
  variant = "neutral",
  className,
  size = "md",
}) => {
  const sizeClasses = componentTokens.badge.sizes[size];
  const variantClasses = componentTokens.badge.variants[variant];

  return (
    <span
      className={clsx(
        componentTokens.badge.base,
        sizeClasses,
        variantClasses,
        className
      )}
      role="badge"
    >
      {children}
    </span>
  );
};