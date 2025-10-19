"use client";
import React, { ReactNode } from "react";
import clsx from "clsx";
import { radius, shadow, theme, transition } from "../../tokens/designTokens";
import { AppText } from "@/components/ui/AppText";
interface PageWrapperProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  stickyHeader?: boolean;
  surface?: boolean; // new: wraps content in a subtle surface background
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  title,
  actions,
  children,
  className,
  stickyHeader = false,
  surface = false,
}) => {
  const t = theme.light;

  return (
    <div className={clsx("flex-1 flex flex-col", className)}>
      {title && (
        <div
          className={clsx(
            "flex items-center justify-between px-6 py-4",
            t.colors.surface,
            shadow.sm,
            radius.md,
            stickyHeader && "sticky top-0 z-20",
            "border-b border-gray-100",
            transition.base
          )}
        >
          <AppText size="heading2" className={t.colors.textPrimary}>
            {title}
          </AppText>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}

      <div
        className={clsx(
          "flex-1 px-6 py-4",
          surface ? t.colors.surface : t.colors.background,
          radius.md,
          shadow.sm
        )}
      >
        {children}
      </div>
    </div>
  );
};
