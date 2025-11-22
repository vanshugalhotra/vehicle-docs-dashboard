import { GroupedPoint } from "@/lib/types/stats.types";
import { BarChart, PieChart } from "@/components/analytics/Chart/index";
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
 * CENTRALIZED CHART DEFAULTS
 * ----------------------------------------------------*/

const defaultBarProps = {
  gradient: true,
  grid: false,
  tooltip: true,
  rounded: true,
  height: 400,
};

const defaultPieProps = {
  gradient: true,
  tooltip: true,
  legend: true,
  innerRadius: 30,
  height: 400,
};

/* -----------------------------------------------------
 * CENTRALIZED PALETTES & ICONS
 * ----------------------------------------------------*/
const variant: "default" | "linear" | "minimal" = "default";
const groupConfig = {
  category: {
    barColor: "#10b981", // Primary green for bar
    colors: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"], // Green, Blue, Orange, Red - high contrast for categories
    icon: <Car />,
    metricVariant: variant,
    label: "Category",
  },
  location: {
    barColor: "#3b82f6", // Primary blue for bar
    colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316"], // Blue, Purple, Pink, Orange - varied for locations
    icon: <MapPin />,
    metricVariant: variant,
    label: "Location",
  },
  owner: {
    barColor: "#8b5cf6", // Primary purple for bar
    colors: ["#8b5cf6", "#06b6d4", "#10b981", "#84cc16"], // Purple, Cyan, Green, Lime - cool/warm mix for owners
    icon: <User />,
    metricVariant: variant,
    label: "Owner",
  },
  driver: {
    barColor: "#ef4444", // Primary red for bar
    colors: ["#ef4444", "#f59e0b", "#eab308", "#d97706"], // Red, Orange, Yellow, Amber - warm spectrum for drivers
    icon: <UserCheck />,
    metricVariant: variant,
    label: "Driver",
  },
};
/* -----------------------------------------------------
 * HELPERS
 * ----------------------------------------------------*/

const renderTop3Cards = (
  data: GroupedPoint[],
  icon: React.ReactNode,
  variant: "default" | "linear" | "minimal",
  groupLabel?: string
) => {
  const top3 = data.sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      {/* --- Added Title --- */}
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

const renderBar = (data: GroupedPoint[], title: string, color: string) => (
  <BarChart
    data={data}
    xKey="label"
    yKey="count"
    title={title}
    barColor={color}
    {...defaultBarProps}
  />
);

const renderPie = (data: GroupedPoint[], title: string, colors: string[]) => (
  <PieChart
    data={data as unknown as Record<string, string | number>[]}
    nameKey="label"
    valueKey="count"
    title={title}
    colors={colors}
    {...defaultPieProps}
  />
);

/* -----------------------------------------------------
 * FINAL CONFIG (SUPER CLEAN)
 * ----------------------------------------------------*/

export const vehiclesByGroupTabs: VehiclesByGroupTabConfig[] = (
  ["category", "location", "owner", "driver"] as VehiclesGroupBy[]
).map((key) => {
  const cfg = groupConfig[key];

  return {
    key,
    label: cfg.label,

    renderLeftChart: (data) =>
      renderBar(data, `Vehicles by ${cfg.label}`, cfg.barColor),

    renderMiddleChart: (data) =>
      renderPie(data, `${cfg.label} Distribution`, cfg.colors),

    renderRightContent: (data) =>
      renderTop3Cards(data, cfg.icon, cfg.metricVariant, cfg.label),
  };
});
