"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppText } from "@/components/ui/AppText";

interface PageWrapperProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  stickyHeader?: boolean;
  surface?: boolean;
}

export const PageWrapper: FC<PageWrapperProps> = ({
  title,
  actions,
  children,
  className,
  stickyHeader = false,
  surface = false,
}) => {
  return (
    <div className={clsx("flex-1 flex flex-col", className)}>
      {title && (
        <div
          className={clsx(
            componentTokens.layout.pageHeader,
            stickyHeader && "sticky top-0 z-20"
          )}
        >
          <AppText size="heading2">
            {title}
          </AppText>
          {actions && <div className={componentTokens.layout.pageHeaderActions}>{actions}</div>}
        </div>
      )}

      <div
        className={clsx(
          componentTokens.layout.pageContent,
          !surface && "bg-background"
        )}
      >
        {children}
      </div>
    </div>
  );
};