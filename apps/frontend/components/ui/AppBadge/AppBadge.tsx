import React, { FC } from "react";
import clsx from "clsx";
import { radius, transition } from "../../tokens/designTokens";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger";

interface AppBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-gray-200 text-gray-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
};

export const AppBadge: FC<AppBadgeProps> = ({
  children,
  variant = "neutral",
  className,
}) => {
  return (
    <span
      className={clsx(
        "inline-block text-sm font-medium px-2 py-1",
        radius.sm,
        transition.base,
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
