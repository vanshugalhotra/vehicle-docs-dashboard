"use client";

import React from "react";
import { useStatsController } from "@/hooks/analytics/useStatsController";
import { useVehicleGroups } from "@/hooks/analytics/useVehicleGroups";
import { useExpiryInsights } from "@/hooks/analytics/useExpiryInsights";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AlertTriangle } from "lucide-react";
import { KeyMetricsSection } from "@/components/analytics/Sections/KeyMetricsSection";
import { HeroSection } from "@/components/analytics/Sections/HeroSection";
import { VehiclesByGroupSection } from "@/components/analytics/Sections/VehiclesByGroupSection";
import { ExpiryInsightsSection } from "@/components/analytics/Sections/ExpiryInsightsSection";

export default function HomePage() {
  const overview = useStatsController("overview");
  const vehicleGroups = useVehicleGroups();
  const expiryInsights = useExpiryInsights();
  const expiryDistribution = useStatsController(
    "documents-expiry-distribution"
  );

  const hasError =
    overview.error || vehicleGroups.error || expiryInsights.error;
  const firstError =
    overview.error?.message ||
    vehicleGroups.error?.message ||
    expiryInsights.error?.message;

  // Date formatting
  const formattedDate = new Date().toLocaleDateString("en-US", {
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
        {hasError && <ErrorAlert message={firstError} />}

        {/* KEY METRICS */}
        <KeyMetricsSection
          data={overview.data}
          isLoading={overview.isLoading}
          trendPeriod="day"
        />

        {/* EXPIRY INSIGHTS */}
        <ExpiryInsightsSection
          data={expiryInsights.data}
          loading={expiryInsights.isLoading}
          totalFleet={overview.data?.totalVehicles}
          expiryBuckets={expiryDistribution.data}
        />

        {/* VEHICLES BY GROUP */}
        <VehiclesByGroupSection
          data={vehicleGroups.data}
          isLoading={vehicleGroups.isLoading}
        />
      </div>
    </div>
  );
}

function ErrorAlert({ message }: { message?: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-danger-light border border-danger/30 rounded-xl shadow-sm">
      <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
      <div className="flex-1">
        <AppText size="label" className="text-danger-text font-semibold">
          Failed to Load Dashboard Metrics
        </AppText>
        <AppText size="caption" className="text-danger-text/80 mt-1">
          {message || "An unexpected error occurred"}
        </AppText>
      </div>
      <AppButton
        variant="ghost"
        size="sm"
        className="text-danger hover:bg-danger-light"
        onClick={() => window.location.reload()}
      >
        Retry
      </AppButton>
    </div>
  );
}
