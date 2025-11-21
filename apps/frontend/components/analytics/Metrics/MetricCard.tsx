"use client";

import React from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import clsx from "clsx";

interface MetricCardProps {
  title: string;
  value?: number | string;
  loading?: boolean;
  icon?: React.ReactNode;
  trend?: {
    rate: number;
    label?: string;
  };
  variant?: "default" | "linear" | "minimal";
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  loading = false,
  icon,
  trend,
  onClick,
  variant = "default",
}: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.rate > 0) return "text-emerald-600 bg-emerald-50/80";
    if (trend.rate < 0) return "text-red-600 bg-red-50/80";
    return "text-gray-600 bg-gray-50/80";
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    const baseClasses = "w-3 h-3 flex-shrink-0";
    if (trend.rate > 0)
      return <ArrowUp className={clsx(baseClasses, "text-emerald-600")} />;
    if (trend.rate < 0)
      return <ArrowDown className={clsx(baseClasses, "text-red-600")} />;
    return <Minus className={clsx(baseClasses, "text-gray-600")} />;
  };

  const getCardClassName = () => {
    const base = clsx(
      "group relative overflow-hidden rounded-2xl border border-border transition-all duration-300",
      "hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 active:translate-y-0",
      "focus-within:ring-2 focus-within:ring-primary/30 focus-within:outline-none"
    );
    if (variant === "linear") {
      return clsx(
        base,
        "bg-linear-to-br from-white via-blue-50/50 to-indigo-50/50",
        "before:absolute before:inset-0 before:bg-linear-to-br before:from-primary/5 before:to-secondary/5 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity"
      );
    }
    if (variant === "minimal") {
      return clsx(
        base,
        "border-border/50 bg-white/80 backdrop-blur-sm shadow-sm"
      );
    }
    return clsx(base, "bg-white shadow-sm");
  };

  const iconContainerClasses = clsx(
    "relative flex items-center justify-center w-12 h-12 rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-110",
    variant === "linear"
      ? "bg-linear-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 ring-1 ring-blue-100/50"
      : "bg-gray-100 text-gray-600"
  );

  return (
    <div onClick={onClick}>
      <AppCard className={getCardClassName()}>
        <div className="space-y-4 relative z-10">
          {/* Header: Title & Icon */}
          <div className="flex items-start justify-between gap-3">
            <AppText
              size="label"
              className="text-muted-foreground font-semibold tracking-tight leading-tight max-w-[70%]"
            >
              {title}
            </AppText>
            {icon && (
              <div className={iconContainerClasses}>
                <div className="relative z-10 transition-colors duration-300 group-hover:text-primary/90">
                  {icon}
                </div>
              </div>
            )}
          </div>

          {/* Value & Trend */}
          <div className="space-y-2">
            {loading ? (
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div
                    className="h-10 w-20 rounded-xl bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"
                    style={{
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                    }}
                  />
                  <div className="h-4 w-16 rounded-full bg-gray-200 animate-pulse" />
                </div>
                <div className="h-3 w-24 rounded-full bg-gray-100 animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between">
                  <AppText
                    as="div"
                    size="heading1"
                    className="font-black text-foreground leading-none tracking-tight"
                  >
                    {value ?? "--"}
                  </AppText>

                  {/* Trend Badge - Positioned at top-right for value */}
                  {trend && (
                    <div
                      className={clsx(
                        "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-200",
                        getTrendColor(),
                        "group-hover:scale-105 group-hover:shadow-md"
                      )}
                      aria-label={`${
                        trend.rate > 0
                          ? "Up"
                          : trend.rate < 0
                          ? "Down"
                          : "No change"
                      } ${Math.abs(trend.rate)}%`}
                    >
                      {getTrendIcon()}
                      <span className="font-bold">
                        {trend.rate > 0 ? "+" : ""}
                        {Math.abs(trend.rate)}%
                      </span>
                      {trend.label && (
                        <span className="text-xs opacity-80 font-normal ml-0.5">
                          {trend.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </AppCard>
    </div>
  );
}
