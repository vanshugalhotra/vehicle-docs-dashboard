"use client";

import * as React from "react";
import type { AuditLogUI, AuditEntity } from "@/lib/types/audit.types";
import { resolveAuditIcon, resolveBadgeVariant } from "@/lib/types/audit.types";

import { AppCard } from "@/components/ui/AppCard";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";

import { ChevronDown, ArrowRight, User, Clock, Database } from "lucide-react";
import clsx from "clsx";

interface AuditLogItemProps {
  log: AuditLogUI;
  defaultExpanded?: boolean;
  onEntityClick?: (entityType: AuditEntity, entityId: string) => void;
  className?: string;
}

export function AuditLogItem({
  log,
  defaultExpanded = false,
  onEntityClick,
  className,
}: AuditLogItemProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const Icon = resolveAuditIcon(log);
  const hasChanges = !!log.context?.changes?.length;
  const hasRelated = !!log.context?.related;
  const hasExpandableContent = hasChanges || hasRelated;
  const badgeVariant = resolveBadgeVariant(log.action);

  return (
    <AppCard
      className={clsx(
        "hover:shadow-sm transition-all duration-200 border-border-subtle hover:border-border",
        expanded && "shadow-xs border-border bg-surface",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon Container */}
        <div className="relative shrink-0">
          <div className="relative">
            <div
              className={clsx(
                "rounded-xl p-3 transition-all duration-300",
                badgeVariant === "success" &&
                  "bg-success-light/80 text-success border border-success/10",
                badgeVariant === "warning" &&
                  "bg-warning-light/80 text-warning border border-warning/10",
                badgeVariant === "danger" &&
                  "bg-danger-light/80 text-danger border border-danger/10",
                badgeVariant === "neutral" &&
                  "bg-surface-subtle text-text-secondary border border-border-subtle",
                log.action === "CREATE" &&
                  "animate-pulse-subtle ring-1 ring-primary/20"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            {/* Status Indicator Dot */}
            <div
              className={clsx(
                "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-surface",
                badgeVariant === "success" && "bg-success",
                badgeVariant === "warning" && "bg-warning",
                badgeVariant === "danger" && "bg-danger",
                badgeVariant === "neutral" && "bg-border"
              )}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-start">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Header with Badge and Summary */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <AppBadge
                    variant={badgeVariant}
                    className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 h-5 font-semibold border-transparent shadow-xs"
                  >
                    {log.action}
                  </AppBadge>
                  <h4 className="font-semibold text-sm text-text-primary leading-tight">
                    {log.summary}
                  </h4>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center flex-wrap gap-3 text-xs">
                  {/* Entity Type */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-subtle border border-border-subtle">
                    <Database className="h-3 w-3 text-text-tertiary" />
                    <span className="font-medium text-text-secondary">
                      {log.entityType}
                    </span>
                  </div>

                  {/* Actor */}
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/10 border border-border-subtle">
                    <User className="h-3 w-3 text-text-tertiary" />
                    <span className="font-medium text-text-secondary">
                      {log.actor.label}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-subtle border border-border-subtle">
                    <Clock className="h-3 w-3 text-text-tertiary" />
                    <time
                      dateTime={log.timestamp.date.toISOString()}
                      className="font-bold text-text-secondary tabular-nums"
                    >
                      {log.timestamp.relative}
                    </time>
                    <span className="text-text-tertiary text-[11px] font-medium">
                      ({log.timestamp.absolute})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Expand Button */}
            <div className="flex items-center justify-end">
              {hasExpandableContent && (
                <AppButton
                  size="sm"
                  variant="ghost"
                  className={clsx(
                    "h-8 px-3 gap-2 text-xs font-medium transition-all duration-200",
                    expanded
                      ? "text-primary bg-primary/5 hover:bg-primary/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
                  )}
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? "Collapse" : "Details"}
                  <ChevronDown
                    className={clsx(
                      "h-3.5 w-3.5 transition-transform duration-300",
                      expanded && "rotate-180"
                    )}
                  />
                </AppButton>
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-border-subtle space-y-6 animate-fade-in">
              {hasChanges && (
                <Section title="Data Changes">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {log.context!.changes!.map((change) => (
                      <div
                        key={change.field}
                        className="p-3 rounded-xl border border-border-subtle bg-surface space-y-2 hover:border-border transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                            {change.field}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-text-tertiary">
                              From
                            </span>
                            <ArrowRight className="h-2.5 w-2.5 text-text-tertiary" />
                            <span className="text-[10px] text-text-tertiary">
                              To
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ValueBox
                            value={change.from}
                            variant="from"
                            isEmpty={!change.from}
                            label="Previous"
                          />
                          <ArrowRight className="h-3 w-3 text-text-tertiary shrink-0 mx-1" />
                          <ValueBox
                            value={change.to}
                            variant="to"
                            isEmpty={!change.to}
                            label="Current"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {hasRelated && (
                <Section title="Related Entities">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(log.context!.related!).map(
                      ([key, value]) =>
                        value && (
                          <button
                            key={key}
                            onClick={() =>
                              onEntityClick?.(
                                key
                                  .replace(/Id$/, "")
                                  .toUpperCase() as AuditEntity,
                                value
                              )
                            }
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-subtle border border-border-subtle text-xs hover:bg-surface hover:border-primary/30 hover:shadow-xs transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <span className="text-text-tertiary font-medium uppercase text-[10px] tracking-tighter">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="text-text-primary font-semibold group-hover:text-primary transition-colors">
                              {value}
                            </span>
                          </button>
                        )
                    )}
                  </div>
                </Section>
              )}
            </div>
          )}
        </div>
      </div>
    </AppCard>
  );
}

/* ======================================================
 * Helpers
 * ====================================================== */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {title}
          </span>
        </div>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>
      {children}
    </div>
  );
}

function ValueBox({
  value,
  variant,
  isEmpty,
  label,
}: {
  value?: string | null;
  variant: "from" | "to";
  isEmpty: boolean;
  label?: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      {label && (
        <span className="text-[10px] font-medium text-text-tertiary mb-1 block">
          {label}
        </span>
      )}
      <div
        className={clsx(
          "px-3 py-2 rounded-lg text-sm font-medium border transition-all truncate",
          isEmpty
            ? "bg-surface-subtle border-dashed border-border-subtle text-text-tertiary italic"
            : variant === "from"
            ? "bg-danger-light/20 border-danger/10 text-danger-text"
            : "bg-success-light/20 border-success/10 text-success-text"
        )}
      >
        {isEmpty ? "Empty" : value}
      </div>
    </div>
  );
}
