"use client";

import * as React from "react";
import type { AuditLogUI, AuditEntity } from "@/lib/types/audit.types";
import { resolveAuditIcon, resolveBadgeVariant } from "@/lib/types/audit.types";

import { AppCard } from "@/components/ui/AppCard";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";

import { ChevronDown, Minus } from "lucide-react";
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
        "p-4 hover:shadow-md transition-all duration-200 hover:border-border/80",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={clsx(
            "mt-1 rounded-lg p-2.5 shrink-0 transition-colors",
            badgeVariant === "success" && "bg-success/10 text-success",
            badgeVariant === "warning" && "bg-warning/10 text-warning",
            badgeVariant === "danger" && "bg-danger/10 text-danger",
            badgeVariant === "neutral" && "bg-muted text-muted-foreground",
            log.action === "CREATE" && "animate-pulse-subtle"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <AppBadge
                  variant={badgeVariant}
                  className={clsx(
                    "text-xs px-2 py-0.5 h-5 font-medium transition-colors",
                    badgeVariant === "success" && "border-success/20",
                    badgeVariant === "warning" && "border-warning/20",
                    badgeVariant === "danger" && "border-danger/20"
                  )}
                >
                  {log.action}
                </AppBadge>
                <span className="font-semibold text-sm text-foreground">
                  {log.summary}
                </span>
              </div>

              {/* Metadata row */}
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                <span
                  className={clsx(
                    "uppercase tracking-wide font-medium px-2 py-1 rounded text-[10px] transition-colors cursor-pointer hover:bg-muted",
                    badgeVariant === "success" &&
                      "bg-success/5 text-success hover:bg-success/10",
                    badgeVariant === "warning" &&
                      "bg-warning/5 text-warning hover:bg-warning/10",
                    badgeVariant === "danger" &&
                      "bg-danger/5 text-danger hover:bg-danger/10",
                    badgeVariant === "neutral" &&
                      "bg-muted text-muted-foreground"
                  )}
                  onClick={() => onEntityClick?.(log.entityType, log.entityId)}
                >
                  {log.entityType}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground/30">•</span>
                  <span
                    className="hover:text-foreground transition-colors cursor-help font-medium"
                    title={`Actor: ${log.actor.label}`}
                  >
                    {log.actor.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground/30">•</span>
                  <time
                    dateTime={log.timestamp.date.toISOString()}
                    className={clsx(
                      "tabular-nums hover:text-foreground transition-colors cursor-help",
                      log.action === "CREATE" && "font-medium"
                    )}
                    title={`${log.timestamp.absolute} (${log.timestamp.relative})`}
                  >
                    {log.timestamp.relative}
                  </time>
                </div>
              </div>
            </div>

            {hasExpandableContent && (
              <AppButton
                size="sm"
                variant="ghost"
                className={clsx(
                  "h-7 w-7 p-0 shrink-0 transition-all hover:bg-muted/60",
                  expanded && "rotate-180 bg-muted/40"
                )}
                onClick={() => setExpanded((v) => !v)}
                aria-label="Toggle audit details"
              >
                <ChevronDown className="h-4 w-4 transition-transform" />
              </AppButton>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t space-y-4 animate-slide-down">
          {/* Changes Section */}
          {hasChanges && (
            <Section title="Changes" icon={<Minus className="h-3 w-3" />}>
              <div className="space-y-3">
                {log.context!.changes!.map((change) => (
                  <div
                    key={change.field}
                    className="group p-3 -mx-1 hover:bg-muted/30 rounded-lg transition-colors"
                  >
                    <div className="mb-2.5">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {change.field}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* From value */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-danger/70 uppercase tracking-wider">
                            from
                          </span>
                        </div>
                        <ValueBox
                          value={change.from}
                          variant="from"
                          isEmpty={!change.from || change.from === ""}
                        />
                      </div>

                      {/* To value */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-success/70 uppercase tracking-wider">
                            to
                          </span>
                        </div>
                        <ValueBox
                          value={change.to}
                          variant="to"
                          isEmpty={!change.to || change.to === ""}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Related Section */}
          {hasRelated && (
            <Section
              title="Related Entities"
              icon={<Minus className="h-3 w-3" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(log.context!.related!).map(([key, value]) => {
                  if (!value) return null;

                  return (
                    <div
                      key={key}
                      className="flex items-center gap-2.5 p-3 bg-muted/30 rounded-lg text-sm hover:bg-muted/50 hover:shadow-sm transition-all group cursor-pointer border border-transparent hover:border-border/50"
                      onClick={() => {
                        const entityType = key.replace(/Id$/, "").toUpperCase();
                        onEntityClick?.(entityType as AuditEntity, value);
                      }}
                    >
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0 group-hover:text-foreground transition-colors">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>
                      <span className="truncate text-foreground font-medium group-hover:text-primary transition-colors">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Empty State */}
          {!hasChanges && !hasRelated && (
            <div className="text-center py-6">
              <div className="text-muted-foreground text-sm mb-1.5">
                No additional details
              </div>
              <div className="text-xs text-muted-foreground/60">
                This log entry contains only basic information
              </div>
            </div>
          )}
        </div>
      )}
    </AppCard>
  );
}

/* ======================================================
 * Internal helpers
 * ====================================================== */

function Section({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon && <div className="text-muted-foreground/70">{icon}</div>}
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
        <div className="flex-1 h-px bg-linear-to-r from-border to-transparent" />
      </div>
      {children}
    </div>
  );
}

type ValueBoxVariant = "from" | "to" | "neutral";

function ValueBox({
  value,
  variant = "neutral",
  isEmpty = false,
}: {
  value?: string | null;
  variant?: ValueBoxVariant;
  isEmpty?: boolean;
}) {
  return (
    <div
      className={clsx(
        "min-w-0 px-3 py-2.5 rounded-lg text-sm border transition-all",
        isEmpty && "italic",
        variant === "from" &&
          clsx(
            "bg-danger/5 border-danger/20",
            !isEmpty && "text-danger/90 font-medium"
          ),
        variant === "to" &&
          clsx(
            "bg-success/5 border-success/20",
            !isEmpty && "text-success/90 font-medium"
          ),
        variant === "neutral" &&
          clsx(
            "bg-muted/30 border-muted/40",
            isEmpty ? "text-muted-foreground" : "text-foreground font-medium"
          )
      )}
    >
      {isEmpty ? (
        <span className="opacity-50 text-xs">— empty —</span>
      ) : (
        <div className="wrap-break-word">{value}</div>
      )}
    </div>
  );
}
