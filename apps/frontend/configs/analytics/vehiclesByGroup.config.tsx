// config/vehiclesChartConfig.ts
import { GroupedPoint } from "@/lib/types/stats.types";
import {
  renderGroupedBarChart,
  renderGroupedPieChart,
} from "@/components/analytics/Chart/chartRenderer";
import { MetricCard } from "@/components/analytics/Cards/MetricCard";
import React from "react";
import { Car, MapPin, User, UserCheck } from "lucide-react";
import { AppText } from "@/components/ui/AppText";

export type VehiclesGroupBy = "category" | "location" | "owner" | "driver";

export interface VehiclesByGroupTabConfig {
  key: VehiclesGroupBy;
  label: string;
  renderLeftChart: (data: GroupedPoint[]) => React.ReactNode;
  renderMiddleChart?: (data: GroupedPoint[]) => React.ReactNode;
  renderRightContent?: (data: GroupedPoint[]) => React.ReactNode;
}

/* -----------------------------------------------------
 * CENTRALIZED PALETTES & ICONS
 * ----------------------------------------------------*/
const variant: "default" | "linear" | "minimal" = "default";
const groupConfig = {
  category: {
    barColor: "#10b981",
    colors: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
    icon: <Car />,
    metricVariant: variant,
    label: "Category",
  },
  location: {
    barColor: "#3b82f6",
    colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316"],
    icon: <MapPin />,
    metricVariant: variant,
    label: "Location",
  },
  owner: {
    barColor: "#8b5cf6",
    colors: ["#8b5cf6", "#06b6d4", "#10b981", "#84cc16"],
    icon: <User />,
    metricVariant: variant,
    label: "Owner",
  },
  driver: {
    barColor: "#ef4444",
    colors: ["#ef4444", "#f59e0b", "#eab308", "#d97706"],
    icon: <UserCheck />,
    metricVariant: variant,
    label: "Driver",
  },
};

/* -----------------------------------------------------
 * CUSTOM CHART PROPS (if you need to override defaults)
 * ----------------------------------------------------*/
const customBarProps = {
  gradient: true,
  grid: false,
  tooltip: true,
  rounded: true,
  height: 400,
};

const customPieProps = {
  gradient: true,
  tooltip: true,
  legend: true,
  innerRadius: 30,
  height: 400,
};

/* -----------------------------------------------------
 * HELPERS
 * ----------------------------------------------------*/

const renderTop3Cards = (
  data: GroupedPoint[],
  icon: React.ReactNode,
  variant: "default" | "linear" | "minimal",
  groupLabel?: string
): React.ReactNode => {
  const top3 = data.sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      {groupLabel && (
        <AppText
          variant="secondary"
          size="heading3"
        >{`Top 3 ${groupLabel}`}</AppText>
      )}

      {top3.map((item, index) => (
        <MetricCard
          key={item.label}
          title={item.label}
          value={item.count}
          icon={icon}
          variant={index === 0 ? "linear" : variant}
          loading={false}
        />
      ))}
    </div>
  );
};

/* -----------------------------------------------------
 * FINAL CONFIG (USING CHART RENDERERS)
 * ----------------------------------------------------*/

export const vehiclesByGroupTabs: VehiclesByGroupTabConfig[] = (
  ["category", "location", "owner", "driver"] as VehiclesGroupBy[]
).map((key) => {
  const cfg = groupConfig[key];

  return {
    key,
    label: cfg.label,

    renderLeftChart: (data) =>
      renderGroupedBarChart(
        data,
        `Vehicles by ${cfg.label}`,
        cfg.barColor,
        customBarProps
      ),

    renderMiddleChart: (data) =>
      renderGroupedPieChart(
        data,
        `${cfg.label} Distribution`,
        cfg.colors,
        customPieProps
      ),

    renderRightContent: (data) =>
      renderTop3Cards(data, cfg.icon, cfg.metricVariant, cfg.label),
  };
});
