"use client";

import React, { useMemo } from "react";
import { useStatsController } from "@/hooks/useStatsController";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AlertTriangle } from "lucide-react";
import { KeyMetricsSection } from "@/components/analytics/Sections/KeyMetricsSection";
import { HeroSection } from "@/components/analytics/Sections/HeroSection";
import { VehiclesByGroupSection } from "@/components/analytics/Sections/VehiclesByGroupSection";
import { GroupedPoint } from "@/lib/types/stats.types";
import { VehiclesGroupBy } from "@/configs/analytics/vehiclesByGroup.config";

export default function HomePage() {
  // Fetch overview metrics
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    error: overviewError,
  } = useStatsController("overview");

  // Fetch grouped vehicles data separately per groupBy
  const categoryStats = useStatsController("vehicles-grouped", {
    groupBy: "category",
  });
  const locationStats = useStatsController("vehicles-grouped", {
    groupBy: "location",
  });
  const ownerStats = useStatsController("vehicles-grouped", {
    groupBy: "owner",
  });
  const driverStats = useStatsController("vehicles-grouped", {
    groupBy: "driver",
  });

  // Combine them for the tabs
  const groupedDataByKey: Record<VehiclesGroupBy, GroupedPoint[]> = useMemo(
    () => ({
      category: categoryStats.data || [],
      location: locationStats.data || [],
      owner: ownerStats.data || [],
      driver: driverStats.data || [],
    }),
    [categoryStats.data, locationStats.data, ownerStats.data, driverStats.data]
  );

  const isGroupedLoading =
    categoryStats.isLoading ||
    locationStats.isLoading ||
    ownerStats.isLoading ||
    driverStats.isLoading;
  const groupedError =
    categoryStats.error ||
    locationStats.error ||
    ownerStats.error ||
    driverStats.error;

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <HeroSection
        title="Yash Group Dashboard"
        subtitle="Real-time Vehicle Management Overview"
        date={formattedDate}
        time={formattedTime}
      />

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-0 py-6 space-y-4">
        {/* ERROR BLOCK */}
        {(overviewError || groupedError) && (
          <div className="flex items-start gap-3 p-4 bg-danger-light border border-danger/30 rounded-xl shadow-sm">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div className="flex-1">
              <AppText size="label" className="text-danger-text font-semibold">
                Failed to Load Dashboard Metrics
              </AppText>
              <AppText size="caption" className="text-danger-text/80 mt-1">
                {overviewError?.message || groupedError?.message}
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

        {/* KEY METRICS */}
        <KeyMetricsSection
          data={overviewData}
          isLoading={isOverviewLoading}
          trendPeriod="day"
        />

        {/* VEHICLES BY GROUP */}
        <VehiclesByGroupSection
          data={groupedDataByKey}
          isLoading={isGroupedLoading}
        />
      </div>
    </div>
  );
}
