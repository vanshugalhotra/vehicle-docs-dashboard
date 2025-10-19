"use client";

import React, { ReactNode } from "react";
import clsx from "clsx";
import { shadow, radius, transition, typography, theme } from "../tokens/designTokens";

interface CRUDPageLayoutProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode; // Usually DataTable or other content
  className?: string;
}

export const CRUDPageLayout: React.FC<CRUDPageLayoutProps> = ({
  title,
  actions,
  children,
  className,
}) => {
  const t = theme.light; // Focus on light theme for now

  return (
    <div className={clsx("flex-1 flex flex-col h-full", className)}>
      {/* Header */}
      {title && (
        <div
          className={clsx(
            "flex items-center justify-between px-6 py-4 mb-4",
            t.colors.background,
            shadow.sm,
            radius.md,
            transition.base
          )}
        >
          <h1 className={clsx(typography.heading2, t.colors.textPrimary)}>
            {title}
          </h1>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 flex flex-col px-6 py-4 overflow-auto bg-gray-50 rounded-md">
        {children}
      </div>
    </div>
  );
};

export default CRUDPageLayout;
