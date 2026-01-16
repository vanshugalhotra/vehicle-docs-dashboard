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
}

export function AuditLogList({
  logs,
  loading = false,
  className,
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
        <div className="h-12 w-12 rounded-full bg-surface-subtle flex items-center justify-center mb-4">
          <Inbox className="h-6 w-6 text-text-tertiary" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary">
          No activity found
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Audit logs will appear here once system actions are performed.
        </p>
      </AppCard>
    );
  }

  return (
    <div className={clsx("relative space-y-4", className)}>
      {/* Decorative Timeline Line - Only visible on desktop to anchor the icons */}
      <div className="absolute left-[34px] top-4 bottom-4 w-px bg-border-subtle hidden sm:block" />

      <div className="flex flex-col gap-4">
        {logs.map((log) => (
          <div key={log.id} className="relative z-10">
            <AuditLogItem log={log} />
          </div>
        ))}
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
  );
}
