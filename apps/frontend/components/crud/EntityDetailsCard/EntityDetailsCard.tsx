"use client";

import { useState } from "react";
import clsx from "clsx";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { Copy, Check, ChevronRight } from "lucide-react";
import { EntityDetailConfig } from "@/lib/types/entity-details.types";

interface Props<T> {
  data: T;
  config: EntityDetailConfig<T>;
  loading?: boolean;
  className?: string;
}

export function EntityDetailsCard<T>({
  data,
  config,
  loading = false,
  className,
}: Props<T>) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: T[keyof T], fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (loading) {
    return (
      <AppCard className={clsx("animate-pulse", className)}>
        <div className="space-y-8 p-6">
          {Array.from({ length: 3 }).map((_, sectionIdx) => (
            <div key={sectionIdx} className="space-y-5">
              {/* Section title skeleton */}
              <div className="space-y-2">
                <div className="h-5 w-40 rounded-lg bg-border-subtle" />
                <div className="h-px w-full bg-border-subtle" />
              </div>

              {/* Fields skeleton */}
              <div
                className={clsx(
                  "grid gap-x-8 gap-y-6",
                  config.columns === 3 ? "grid-cols-3" : "grid-cols-2"
                )}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2.5">
                    <div className="h-3.5 w-28 rounded bg-border-subtle/60" />
                    <div className="h-6 w-full max-w-[220px] rounded-lg bg-border-subtle" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard
      className={clsx(
        "overflow-hidden transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      <div className="divide-y divide-border-subtle/50">
        {config.sections.map((section, sectionIdx) => (
          <div key={`${section.title || sectionIdx}`} className="p-6 space-y-6">
            {/* Section Header */}
            {section.title && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AppText
                    as="h3"
                    size="heading3"
                    className="font-semibold text-text-primary tracking-tight"
                  >
                    {section.title}
                  </AppText>
                </div>
                {section.description && (
                  <AppText
                    as="p"
                    size="bodySecondary"
                    className="text-text-secondary -mt-1"
                  >
                    {section.description}
                  </AppText>
                )}
                <div className="h-px bg-linear-to-r from-border-subtle/30 via-border-subtle to-border-subtle/30" />
              </div>
            )}

            {/* Fields Grid */}
            <div
              className={clsx(
                "grid gap-x-8 gap-y-7",
                config.columns === 3 ? "grid-cols-3" : "grid-cols-2",
                !section.title && "pt-2"
              )}
            >
              {section.fields.map((field) => {
                const value = data[field.key];
                const fieldKey = String(field.key);
                const isCopied = copiedField === fieldKey;
                const isEmpty =
                  value === null || value === undefined || value === "";
                const hasAction = field.onClick;

                if (field.hideIfEmpty && isEmpty) {
                  return null;
                }

                return (
                  <div
                    key={fieldKey}
                    className={clsx(
                      "group flex flex-col gap-2",
                      field.span === 2 && "col-span-2",
                      field.span === 3 && "col-span-3"
                    )}
                  >
                    {/* Label with icon */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {field.icon && (
                          <span className="text-text-tertiary shrink-0 w-4 h-4 flex items-center justify-center">
                            {field.icon}
                          </span>
                        )}
                        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide truncate">
                          {field.label}
                        </span>
                      </div>
                    </div>

                    {/* Value with actions */}
                    <div className="flex items-start gap-2 min-w-0">
                      <div
                        className={clsx(
                          "text-sm flex-1 min-w-0 wrap-break-word transition-all duration-200",
                          hasAction && !isEmpty && "group relative",
                          isEmpty && "text-text-tertiary italic"
                        )}
                        onClick={() => !isEmpty && field.onClick?.(value, data)}
                      >
                        <span
                          className={clsx(
                            "inline-block",
                            hasAction &&
                              !isEmpty &&
                              "cursor-pointer text-primary hover:text-primary-dark hover:underline underline-offset-2 transition-colors duration-200"
                          )}
                        >
                          {field.render
                            ? field.render(value, data)
                            : isEmpty
                            ? "—"
                            : String(value)}
                        </span>

                        {/* Action indicator */}
                        {hasAction && !isEmpty && (
                          <span className="ml-1.5 inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ChevronRight className="h-3 w-3 inline -mt-0.5" />
                          </span>
                        )}
                      </div>

                      {/* Copy button */}
                      {field.copyable && !isEmpty && (
                        <AppButton
                          size="sm"
                          variant="ghost"
                          className={clsx(
                            "opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0",
                            isCopied && "opacity-100 text-green-600!"
                          )}
                          onClick={() => handleCopy(value, fieldKey)}
                          aria-label={isCopied ? "Copied" : "Copy to clipboard"}
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </AppButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AppCard>
  );
}
