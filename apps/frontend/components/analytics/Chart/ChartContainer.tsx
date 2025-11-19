"use client";

import React from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";

interface ChartContainerProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  description,
  actions,
  children,
  className,
}: ChartContainerProps) {
  return (
    <AppCard padded bordered className={className}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <AppText as="h3" size="heading3">
            {title}
          </AppText>
          {description && (
            <AppText size="label" className="text-muted-foreground mt-1">
              {description}
            </AppText>
          )}
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      <div className="w-full h-[260px] flex items-center justify-center">
        {children}
      </div>
    </AppCard>
  );
}
