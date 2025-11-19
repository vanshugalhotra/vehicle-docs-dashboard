"use client";

import React from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value?: number | string;
  loading?: boolean;
  icon?: React.ReactNode;
  trend?: {
    rate: number;
    label?: string;
  };
  variant?: "default" | "gradient" | "minimal";
}

export function MetricCard({
  title,
  value,
  loading = false,
  icon,
  trend,
  variant = "default",
}: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.rate > 0) return "text-emerald-600 bg-emerald-50";
    if (trend.rate < 0) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.rate > 0) return <ArrowUp className="w-3.5 h-3.5" />;
    if (trend.rate < 0) return <ArrowDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getCardClassName = () => {
    const base = "group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5";
    if (variant === "gradient") return `${base} bg-gradient-to-br from-white to-gray-50/50`;
    if (variant === "minimal") return `${base} border-0 shadow-sm`;
    return base;
  };

  return (
    <AppCard padded bordered className={getCardClassName()}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <AppText 
            size="label" 
            className="text-gray-600 font-medium tracking-tight"
          >
            {title}
          </AppText>
          
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 text-blue-600 group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              <div className="h-9 w-32 rounded-lg bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" 
                   style={{ backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} 
              />
              <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
            </div>
          ) : (
            <>
              <AppText 
                as="div" 
                size="heading2" 
                className="font-bold text-gray-900 tracking-tight leading-none"
              >
                {value ?? "--"}
              </AppText>

              {/* Trend Badge */}
              {trend && (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getTrendColor()} transition-colors duration-200`}>
                  {getTrendIcon()}
                  <span>
                    {trend.rate > 0 ? "+" : ""}
                    {Math.abs(trend.rate)}%
                  </span>
                  {trend.label && (
                    <span className="opacity-70 font-normal ml-0.5">
                      {trend.label}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </AppCard>
  );
}