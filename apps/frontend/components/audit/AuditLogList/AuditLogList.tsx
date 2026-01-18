"use client";

import * as React from "react";
import { AuditLogUI } from "@/lib/types/audit.types";
import { AuditLogItem } from "../AuditLogItem/AuditLogItem";
import { AppCard } from "@/components/ui/AppCard";
import { Inbox } from "lucide-react";
import clsx from "clsx";

interface AuditLogListProps {
  logs: AuditLogUI[];
  loading?: boolean;
  className?: string;
  page: number;
  pageSize: number;
}

export function AuditLogList({
  logs,
  loading = false,
  className,
  page,
  pageSize,
}: AuditLogListProps) {
  if (loading) {
    return <AuditLogListSkeleton className={className} />;
  }

  if (!logs.length) {
    return (
      <AppCard
        className={clsx(
          "p-12 flex flex-col items-center justify-center border-dashed bg-background",
          className
        )}
      >
        <div className="flex items-center justify-center flex-col">
          <div className="h-12 w-12 rounded-full bg-surface-subtle flex items-center justify-center mb-4">
            <Inbox className="h-6 w-6 text-text-tertiary" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">
            No activity found
          </h3>
        </div>
      </AppCard>
    );
  }

  const startSerialNumber = (page - 1) * pageSize + 1;

  return (
    <div className={clsx("relative space-y-4", className)}>
      {/* Decorative Timeline Line - Only visible on desktop to anchor the icons */}
      <div className="absolute left-[84px] top-4 bottom-4 w-px bg-border-subtle hidden sm:block" />

      <div className="flex flex-col gap-4">
        {logs.map((log, index) => {
          const serialNumber = startSerialNumber + index;
          return (
            <div key={log.id} className="relative z-10">
              <div className="flex items-start gap-3">
                {/* Serial Number Container */}
                <div className="w-12 shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-surface-subtle border border-border-subtle">
                    <span className="text-sm font-medium text-text-secondary tabular-nums">
                      {serialNumber}
                    </span>
                  </div>
                </div>

                {/* Audit Log Item */}
                <div className="flex-1 min-w-0">
                  <AuditLogItem log={log} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ======================================================
 * Skeletons
 * ====================================================== */

function AuditLogListSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("space-y-4", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <AuditLogItemSkeleton key={i} />
      ))}
    </div>
  );
}

function AuditLogItemSkeleton() {
  return (
    <div className="flex items-start gap-3">
      {/* Serial Number Skeleton */}
      <div className="w-12 shrink-0">
        <div className="h-10 w-10 rounded-lg bg-surface-subtle animate-pulse" />
      </div>

      {/* Audit Log Item Skeleton */}
      <div className="flex-1">
        <AppCard className="p-4 border-border-subtle bg-surface">
          <div className="flex gap-5">
            {/* Icon Skeleton */}
            <div className="h-10 w-10 rounded-xl bg-surface-subtle animate-pulse shrink-0" />

            <div className="flex-1 space-y-4 py-1">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  {/* Badge + Summary */}
                  <div className="flex gap-2 items-center">
                    <div className="h-5 w-16 rounded bg-surface-subtle animate-pulse" />
                    <div className="h-5 w-2/3 rounded bg-surface-subtle animate-pulse" />
                  </div>
                  {/* Meta data line */}
                  <div className="h-3 w-1/2 rounded bg-surface-subtle/60 animate-pulse" />
                </div>
                {/* Absolute Timestamp placeholder */}
                <div className="h-8 w-24 rounded-lg bg-surface-subtle/40 animate-pulse hidden md:block" />
              </div>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
