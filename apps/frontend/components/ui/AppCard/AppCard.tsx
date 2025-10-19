"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { theme, radius, shadow, transition } from "../../tokens/designTokens";
import { AppText } from "../AppText";

interface AppCardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  hoverable?: boolean; // subtle hover elevation for dashboard cards
  bordered?: boolean;
  padded?: boolean;
}

export const AppCard: FC<AppCardProps> = ({
  title,
  subtitle,
  actions,
  children,
  className,
  hoverable = false,
  bordered = true,
  padded = true,
}) => {
  const t = theme.light;

  return (
    <div
      className={clsx(
        "bg-white flex flex-col",
        radius.md,
        shadow.sm,
        transition.base,
        bordered && "border border-gray-200",
        hoverable && "hover:shadow-md hover:-translate-y-[1px]",
        className
      )}
    >
      {(title || actions) && (
        <div
          className={clsx(
            "flex justify-between items-start gap-2",
            padded && "px-4 pt-4"
          )}
        >
          <div className="flex flex-col">
            {title && (
              <AppText as="h3" size="heading3" className={t.colors.textPrimary}>
                {title}
              </AppText>
            )}
            {subtitle && (
              <AppText size="sm" className={t.colors.textSecondary}>
                {subtitle}
              </AppText>
            )}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      )}

      <div className={clsx(padded && "p-4 pt-2")}>{children}</div>
    </div>
  );
};
