"use client";

import * as React from "react";
import { AuditLogUI } from "@/lib/types/audit.types";
import { AuditLogItem } from "../AuditLogItem/AuditLogItem";
import { AppCard } from "@/components/ui/AppCard";
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
        className={clsx("p-8 text-center text-muted-foreground", className)}
      >
        No audit activity found
      </AppCard>
    );
  }

  return (
    <div className={clsx("flex flex-col divide-y divide-border", className)}>
      {logs.map((log) => (
        <AuditLogItem key={log.id} log={log} />
      ))}
    </div>
  );
}

/* ======================================================
 * Skeletons
 * ====================================================== */

function AuditLogListSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("flex flex-col divide-y divide-border", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <AuditLogItemSkeleton key={i} />
      ))}
    </div>
  );
}

function AuditLogItemSkeleton() {
  return (
    <AppCard className="p-4 animate-pulse">
      <div className="flex gap-4">
        {/* Icon */}
        <div className="h-9 w-9 rounded-full bg-muted" />

        <div className="flex-1 space-y-2">
          {/* Summary */}
          <div className="h-4 w-3/4 rounded bg-muted" />

          {/* Meta line */}
          <div className="h-3 w-1/2 rounded bg-muted" />

          {/* Timestamp */}
          <div className="h-3 w-1/3 rounded bg-muted" />
        </div>
      </div>
    </AppCard>
  );
}
