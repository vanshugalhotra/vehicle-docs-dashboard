"use client";

import { ReactNode } from "react";
import { AppText } from "@/components/ui/AppText";
import clsx from "clsx";

interface StatsSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;            
  actions?: ReactNode;       
  loading?: boolean;
  className?: string;
  children: ReactNode;
}

export function StatsSection({
  title,
  description,
  icon,
  actions,
  loading,
  className,
  children,
}: StatsSectionProps) {
  return (
    <section
      className={clsx(
        "space-y-5 rounded-2xl border border-border p-6 bg-surface",
        className
      )}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        {/* Left: icon + title/description */}
        <div className="flex items-start gap-3">
          {icon && (
            <div className="mt-1 text-primary">
              {icon}
            </div>
          )}

          <div className="space-y-1">
            <AppText size="heading3" className="font-semibold text-text-primary">
              {title}
            </AppText>

            {description && (
              <AppText size="body" variant="muted">
                {description}
              </AppText>
            )}
          </div>
        </div>

        {/* Right: action buttons */}
        {actions && <div>{actions}</div>}
      </div>

      {/* Body */}
      <div className="w-full">
        {loading ? (
          <div className="h-20 rounded-lg bg-muted/20 animate-pulse" />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
