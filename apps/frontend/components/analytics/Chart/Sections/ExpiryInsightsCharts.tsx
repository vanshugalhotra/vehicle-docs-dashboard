import React, { useMemo } from "react";
import { BucketPoint, GroupedPoint } from "@/lib/types/stats.types";
import {
  renderGroupedBarChart,
  renderGroupedPieChart,
  renderGroupedLineChart,
} from "@/components/analytics/Chart/chartRenderer";

interface ExpiryInsightsChartsProps {
  expiryBuckets?: BucketPoint[];
}

// Chart colors for expiry insights
const EXPIRY_CHART_COLORS = [
  "#ef4444", // red for expired
  "#f59e0b", // orange for today
  "#eab308", // yellow for 1 day
  "#84cc16", // lime for 1 week
  "#3b82f6", // blue for 1 month
  "#10b981", // green for 1 year
];

export function ExpiryInsightsCharts({
  expiryBuckets = [],
}: ExpiryInsightsChartsProps) {
  const chartData: GroupedPoint[] = expiryBuckets.map((b) => ({
    label: b.bucket,
    count: b.count,
  }));

  const timeSeriesData = useMemo(() => {
    if (!expiryBuckets.length) return [];

    return [...expiryBuckets]
      .sort((a, b) => {
        const getStartDay = (bucket: string) =>
          parseInt(bucket.split("-")[0]) || 0;
        return getStartDay(a.bucket) - getStartDay(b.bucket);
      })
      .map((bucket) => ({
        label: bucket.bucket,
        count: bucket.count,
      }));
  }, [expiryBuckets]);

  if (chartData.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="md:col-span-2 lg:col-span-1">
          {renderGroupedLineChart(timeSeriesData, "Expiry Trend", "#10b981", {
            height: 400,
            grid: true,
            tooltip: true,
            gradient: false,
          })}
        </div>

        {/* Bar Chart */}
        <div className="md:col-span-1 lg:col-span-1">
          {renderGroupedBarChart(chartData, "Distribution", "#3b82f6", {
            height: 400,
            grid: true,
            gradient: false,
          })}
        </div>

        {/* Pie Chart */}
        <div className="md:col-span-1 lg:col-span-1">
          {renderGroupedPieChart(chartData, "Breakdown", EXPIRY_CHART_COLORS, {
            height: 400,
            gradient: false,
          })}
        </div>
      </div>
    </div>
  );
}
