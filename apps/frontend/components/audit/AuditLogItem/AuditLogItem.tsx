"use client";

import * as React from "react";
import type { AuditLogUI, AuditEntity } from "@/lib/types/audit.types";
import { resolveAuditIcon, resolveBadgeVariant } from "@/lib/types/audit.types";

import { AppCard } from "@/components/ui/AppCard";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";

import { ChevronDown, ArrowRight } from "lucide-react";
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
        "hover:shadow-md transition-all duration-200 border-border/60 hover:border-border-hover",
        className
      )}
    >
      <div className="flex items-start gap-5">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div
            className={clsx(
              "rounded-xl p-2.5 transition-colors shadow-sm",
              badgeVariant === "success" && "bg-success-light text-success",
              badgeVariant === "warning" && "bg-warning-light text-warning",
              badgeVariant === "danger" && "bg-danger-light text-danger",
              badgeVariant === "neutral" &&
                "bg-surface-subtle text-text-secondary",
              log.action === "CREATE" && "animate-pulse-subtle"
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          {/* Visual vertical connector for a timeline feel */}
          <div className="w-px h-full bg-border-subtle min-h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <AppBadge
                  variant={badgeVariant}
                  className="text-[10px] uppercase tracking-wider px-2 py-0 h-5 font-bold border-transparent"
                >
                  {log.action}
                </AppBadge>
                <h4 className="font-semibold text-sm text-text-primary tracking-tight">
                  {log.summary}
                </h4>
              </div>

              <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-secondary">
                {/* Entity Type*/}
                <AppBadge
                  variant="neutral"
                  size="sm"
                >
                  {log.entityType}
                </AppBadge>

                {/* Actor */}
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-border-hover" />
                  <span className="font-medium">{log.actor.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-border-hover" />
                  <time
                    dateTime={log.timestamp.date.toISOString()}
                    className="tabular-nums font-medium text-text-primary"
                  >
                    {log.timestamp.relative}
                  </time>
                  <span className="text-text-tertiary">
                    ({log.timestamp.absolute})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              {hasExpandableContent && (
                <AppButton
                  size="sm"
                  variant="ghost"
                  className={clsx(
                    "h-8 px-3 gap-2 text-xs font-semibold hover:bg-surface-subtle transition-all",
                    expanded
                      ? "text-primary bg-primary-light"
                      : "text-text-secondary"
                  )}
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? "Hide Details" : "View Details"}
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
        </div>
      </div>

      {expanded && (
        <div className="mt-5 pt-5 border-t border-border-subtle space-y-6 animate-fade-in">
          {hasChanges && (
            <Section title="Data Changes">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {log.context!.changes!.map((change) => (
                  <div
                    key={change.field}
                    className="flex flex-col gap-2 p-3 rounded-xl border border-border-subtle bg-surface-hover/50"
                  >
                    <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-1">
                      {change.field}
                    </span>
                    <div className="flex items-center gap-2">
                      <ValueBox
                        value={change.from}
                        variant="from"
                        isEmpty={!change.from}
                      />
                      <ArrowRight className="h-3 w-3 text-text-tertiary shrink-0" />
                      <ValueBox
                        value={change.to}
                        variant="to"
                        isEmpty={!change.to}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {hasRelated && (
            <Section title="Relationships">
              <div className="flex flex-wrap gap-2">
                {Object.entries(log.context!.related!).map(
                  ([key, value]) =>
                    value && (
                      <div
                        key={key}
                        onClick={() =>
                          onEntityClick?.(
                            key.replace(/Id$/, "").toUpperCase() as AuditEntity,
                            value
                          )
                        }
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-subtle border border-border text-xs hover:border-primary/30 hover:bg-white hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <span className="text-text-secondary font-medium uppercase text-[10px] tracking-tighter">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </span>
                        <span className="text-text-primary font-bold group-hover:text-primary">
                          {value}
                        </span>
                      </div>
                    )
                )}
              </div>
            </Section>
          )}
        </div>
      )}
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
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-text-tertiary">
          {title}
        </span>
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
}: {
  value?: string | null;
  variant: "from" | "to";
  isEmpty: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex-1 min-w-0 px-3 py-2 rounded-lg text-xs font-medium border transition-all truncate",
        isEmpty
          ? "bg-surface-subtle border-dashed border-border-hover text-text-tertiary italic"
          : variant === "from"
          ? "bg-danger-light/30 border-danger/10 text-danger-text"
          : "bg-success-light/30 border-success/10 text-success-text"
      )}
    >
      {isEmpty ? "none" : value}
    </div>
  );
}
