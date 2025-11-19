"use client";

import React from "react";
import { StatsSection } from "@/components/analytics/layout/StatsSection";
import { MetricsGrid } from "@/components/analytics/Metrics/MetricsGrid";
import { MetricCard } from "@/components/analytics/Metrics/MetricCard";
import { AppText } from "@/components/ui/AppText";
import { TrendingUp } from "lucide-react";
import { dashboardMetricsConfig } from "@/configs/analytics/dashboardMetrics.config";
import { OverviewStats } from "@/lib/types/stats.types";

interface KeyMetricsSectionProps {
  data?: OverviewStats;
  isLoading?: boolean;
}

export const KeyMetricsSection: React.FC<KeyMetricsSectionProps> = ({
  data,
  isLoading = false,
}) => {
  return (
    <StatsSection
      title="Key Metrics"
      icon={<TrendingUp className="w-5 h-5 text-primary" />}
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
        {dashboardMetricsConfig.map((cfg) => {
          const rawValue = data?.[cfg.key];
          let value: string | number | undefined;

          if (cfg.formatter && rawValue !== undefined) {
            value = cfg.formatter(rawValue);
          } else if (typeof rawValue === "number" || typeof rawValue === "string") {
            value = rawValue;
          } else if (Array.isArray(rawValue)) {
            value = rawValue.length;
          }

          const mockTrend =
            Math.random() > 0.5 ? { rate: 12, label: "vs last month" } : { rate: -5, label: "vs last week" };

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
  );
};
