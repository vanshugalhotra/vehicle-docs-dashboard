"use client";

import { MetricCard } from "@/components/analytics/Metrics/MetricCard";
import { MetricsGrid } from "@/components/analytics/Metrics/MetricsGrid";
import { StatsSection } from "@/components/analytics/layout/StatsSection";

import { useStatsController } from "@/hooks/useStatsController";
import { dashboardMetricsConfig } from "@/configs/analytics/dashboardMetrics.config";

import {
  Activity,
  AlertTriangle,
  Clock,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";

import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

export default function HomePage() {
  const { data, isLoading, error } = useStatsController("overview");

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* ------------------------------------------------------- */}
      {/* HERO HEADER */}
      {/* ------------------------------------------------------- */}
      <div className="relative overflow-hidden bg-linear-to-br from-primary/5 via-surface to-primary/5 border-b border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-info/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 backdrop-blur-sm">
                  <LayoutDashboard className="w-6 h-6 text-primary" />
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-text-primary via-primary to-text-primary bg-clip-text text-transparent">
                    Yash Group Dashboard
                  </h1>

                  <AppText
                    size="body"
                    variant="muted"
                    className="flex items-center gap-2 mt-1"
                  >
                    <Activity className="w-4 h-4" />
                    Real-time Vehicle Management Overview
                  </AppText>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/80 backdrop-blur-sm rounded-lg border border-border-subtle">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium">{formattedDate}</span>
                </div>

                <div className="px-3 py-1.5 bg-surface/80 backdrop-blur-sm rounded-lg border border-border-subtle">
                  <span className="font-mono font-medium">{formattedTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- */}
      {/* MAIN CONTENT */}
      {/* ------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-0 py-6 space-y-8">
        {/* ERROR BLOCK */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-danger-light border border-danger/30 rounded-xl shadow-sm">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div className="flex-1">
              <AppText size="label" className="text-danger-text font-semibold">
                Failed to Load Dashboard Metrics
              </AppText>
              <AppText size="caption" className="text-danger-text/80 mt-1">
                {error.message}
              </AppText>
            </div>
            <AppButton
              variant="ghost"
              size="sm"
              className="text-danger hover:bg-danger-light"
            >
              Retry
            </AppButton>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* KEY METRICS - now wrapped inside StatsSection */}
        {/* ------------------------------------------------------- */}
        <StatsSection
          title="Key Metrics"
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          description=""
          loading={isLoading}
          actions={
            !isLoading && data ? (
              <AppText size="caption" variant="muted">
                Last updated: just now
              </AppText>
            ) : null
          }
        >
          <MetricsGrid>
            {dashboardMetricsConfig.map((cfg, index) => {
              const rawValue = data?.[cfg.key];

              let value: string | number | undefined;

              // format value based on config
              if (cfg.formatter && rawValue !== undefined) {
                value = cfg.formatter(rawValue);
              } else if (
                typeof rawValue === "number" ||
                typeof rawValue === "string"
              ) {
                value = rawValue;
              } else if (Array.isArray(rawValue)) {
                value = rawValue.length;
              }

              // mock trends for now
              const mockTrend =
                index % 3 === 0
                  ? { rate: 12, label: "vs last month" }
                  : index % 3 === 1
                  ? { rate: -5, label: "vs last week" }
                  : undefined;

              return (
                <MetricCard
                  key={cfg.key}
                  title={cfg.title}
                  value={value}
                  loading={isLoading}
                  icon={cfg.icon}
                  variant={cfg.variant ?? "default"}
                  trend={mockTrend}
                />
              );
            })}
          </MetricsGrid>
        </StatsSection>
      </div>
    </div>
  );
}
