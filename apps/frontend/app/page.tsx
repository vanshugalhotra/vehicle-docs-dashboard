"use client";

import React, { useMemo } from "react";
import { useStatsController } from "@/hooks/useStatsController";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AlertTriangle } from "lucide-react";
import { KeyMetricsSection } from "@/components/analytics/Sections/KeyMetricsSection";
import { HeroSection } from "@/components/analytics/Sections/HeroSection";
import { VehiclesByGroupSection } from "@/components/analytics/Sections/VehiclesByGroupSection";
import { ExpiryInsightsSection } from "@/components/analytics/Sections/ExpiryInsightsSection";
import { GroupedPoint, ExpiryInsights } from "@/lib/types/stats.types";
import { VehiclesGroupBy } from "@/configs/analytics/vehiclesByGroup.config";

export default function HomePage() {
  // -----------------------------
  // Overview metrics
  // -----------------------------
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    error: overviewError,
  } = useStatsController("overview");

  // -----------------------------
  // Grouped vehicle stats
  // -----------------------------
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

  // -----------------------------
  // Expiry insights per status
  // -----------------------------
  const expiredStats = useStatsController("vehicle-document", {
    status: "expired",
  });
  const todayStats = useStatsController("vehicle-document", {
    status: "today",
  });
  const in1DayStats = useStatsController("vehicle-document", {
    status: "in_1_day",
  });
  const in1WeekStats = useStatsController("vehicle-document", {
    status: "in_1_week",
  });
  const in1MonthStats = useStatsController("vehicle-document", {
    status: "in_1_month",
  });
  const in1YearStats = useStatsController("vehicle-document", {
    status: "in_1_year",
  });

  const expiryInsights: ExpiryInsights[] = useMemo(
    () => [
      {
        status: "expired",
        data: expiredStats.data ?? {
          items: [],
          totalDocuments: 0,
          totalVehicles: 0,
        },
      },
      {
        status: "today",
        data: todayStats.data ?? {
          items: [],
          totalDocuments: 0,
          totalVehicles: 0,
        },
      },
      {
        status: "in_1_day",
        data: in1DayStats.data ?? {
          items: [],
          totalDocuments: 0,
          totalVehicles: 0,
        },
      },
      {
        status: "in_1_week",
        data: in1WeekStats.data ?? {
          items: [],
          totalDocuments: 0,
          totalVehicles: 0,
        },
      },
      {
        status: "in_1_month",
        data: in1MonthStats.data ?? {
          items: [],
          totalDocuments: 0,
          totalVehicles: 0,
        },
      },
      {
        status: "in_1_year",
        data: in1YearStats.data ?? {
          items: [],
          totalDocuments: 0,
          totalVehicles: 0,
        },
      },
    ],
    [
      expiredStats.data,
      todayStats.data,
      in1DayStats.data,
      in1WeekStats.data,
      in1MonthStats.data,
      in1YearStats.data,
    ]
  );

  const isExpiringLoading =
    expiredStats.isLoading ||
    todayStats.isLoading ||
    in1DayStats.isLoading ||
    in1WeekStats.isLoading ||
    in1MonthStats.isLoading ||
    in1YearStats.isLoading;

  const expiringError =
    expiredStats.error ||
    todayStats.error ||
    in1DayStats.error ||
    in1WeekStats.error ||
    in1MonthStats.error ||
    in1YearStats.error;

  // -----------------------------
  // Date formatting
  // -----------------------------
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <HeroSection
        title="Yash Group Dashboard"
        subtitle="Real-time Vehicle Management Overview"
        date={formattedDate}
      />

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-0 py-6 space-y-4">
        {/* ERROR BLOCK */}
        {(overviewError || groupedError || expiringError) && (
          <div className="flex items-start gap-3 p-4 bg-danger-light border border-danger/30 rounded-xl shadow-sm">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div className="flex-1">
              <AppText size="label" className="text-danger-text font-semibold">
                Failed to Load Dashboard Metrics
              </AppText>
              <AppText size="caption" className="text-danger-text/80 mt-1">
                {overviewError?.message ||
                  groupedError?.message ||
                  expiringError?.message}
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

        {/* EXPIRY INSIGHTS */}
        <ExpiryInsightsSection
          data={expiryInsights}
          loading={isExpiringLoading}
          totalFleet={overviewData?.totalVehicles}
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
