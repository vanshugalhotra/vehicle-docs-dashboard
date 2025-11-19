"use client";

import { MetricCard } from "@/components/analytics/Metrics/MetricCard";
import { MetricsGrid } from "@/components/analytics/Metrics/MetricsGrid";
import { useStatsController } from "@/hooks/useStatsController";
import { AlertTriangle, CheckCircle, FileWarning, Truck } from "lucide-react";

export default function HomePage() {
  const { data, isLoading, error } = useStatsController("overview");

  const stats = data;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-700">
        Welcome to Yash Group Dashboard
      </h2>

      {/* Error State */}
      {error && (
        <div className="text-red-500 text-sm">
          Failed to load dashboard metrics: {error.message}
        </div>
      )}

      {/* Metrics Grid */}
      <MetricsGrid>
        {/* Total Vehicles */}
        <MetricCard
          title="Total Vehicles"
          value={stats?.totalVehicles}
          loading={isLoading}
          icon={<Truck className="w-5 h-5" />}
        />

        {/* New Vehicles */}
        <MetricCard
          title="New Vehicles"
          value={stats?.newVehicles}
          loading={isLoading}
          icon={<CheckCircle className="w-5 h-5" />}
        />

        {/* Total Documents */}
        <MetricCard
          title="Total Documents"
          value={stats?.totalDocuments}
          loading={isLoading}
          icon={<CheckCircle className="w-5 h-5" />}
        />

        {/* Expiring Soon */}
        <MetricCard
          title="Expiring Soon"
          value={stats?.documentsExpiringSoon}
          loading={isLoading}
          icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />}
        />

        {/* Expired */}
        <MetricCard
          title="Expired"
          value={stats?.documentsExpired}
          loading={isLoading}
          icon={<FileWarning className="w-5 h-5 text-red-600" />}
        />

        {/* Compliance */}
        <MetricCard
          title="Compliance Rate"
          value={
            stats?.complianceRate !== undefined
              ? `${stats.complianceRate}%`
              : "--"
          }
          loading={isLoading}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
        />
      </MetricsGrid>
    </div>
  );
}
