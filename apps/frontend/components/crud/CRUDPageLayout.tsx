"use client";

import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppText } from "@/components/ui/AppText";

interface CRUDPageLayoutProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const CRUDPageLayout: FC<CRUDPageLayoutProps> = ({
  title,
  actions,
  children,
  className,
}) => {
  return (
    <div className={clsx("flex-1 flex flex-col h-full", className)}>
      {/* Header */}
      {title && (
        <div className={componentTokens.layout.pageHeader}>
          <AppText size="heading2">
            {title}
          </AppText>
          {actions && <div className={componentTokens.layout.pageHeaderActions}>{actions}</div>}
        </div>
      )}

      {/* Content area */}
      <div className={componentTokens.layout.pageContent}>
        {children}
      </div>
    </div>
  );
};

export default CRUDPageLayout;