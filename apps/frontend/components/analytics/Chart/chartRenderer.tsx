import {
  BarChart,
  PieChart,
  LineChart,
} from "@/components/analytics/Chart/index";
import { GroupedPoint } from "@/lib/types/stats.types";
import { ReactNode } from "react";
import { TooltipProps } from "./core/ChartToolTip";

// Common base props for all charts
interface BaseChartProps {
  height?: number;
  width?: string | number;
  title?: string;
  gradient?: boolean;
  tooltip?: boolean;
  animate?: boolean;
}

// Chart-specific renderer props
interface BarChartRendererProps<T> extends BaseChartProps {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  barColor?: string;
  grid?: boolean;
  legend?: boolean;
  rounded?: boolean;
  hoverEffect?: boolean;
  customTooltip?: (props: TooltipProps) => React.ReactNode;
}

// Pie chart needs Record<string, string | number> constraint
interface PieChartRendererProps<T extends Record<string, string | number>> extends BaseChartProps {
  data: T[];
  nameKey: keyof T;
  valueKey: keyof T;
  colors?: string[];
  legend?: boolean;
  innerRadius?: number;
  hoverEffect?: boolean;
  customTooltip?: (props: TooltipProps) => React.ReactNode;
}

interface LineChartRendererProps<T> extends BaseChartProps {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  lineColor?: string;
  grid?: boolean;
  legend?: boolean;
  hoverEffect?: boolean;
  customTooltip?: (props: TooltipProps) => React.ReactNode;
}

// Default configurations
export const defaultBarProps = {
  gradient: true,
  grid: false,
  tooltip: true,
  rounded: true,
  height: 400,
  animate: true,
  hoverEffect: true,
};

export const defaultPieProps = {
  gradient: true,
  tooltip: true,
  legend: true,
  innerRadius: 30,
  height: 400,
  animate: true,
  hoverEffect: true,
};

export const defaultLineProps = {
  gradient: true,
  grid: true,
  tooltip: true,
  legend: false,
  height: 400,
  animate: true,
  hoverEffect: true,
};

// Generic render functions
export const renderBarChart = <T,>(
  props: BarChartRendererProps<T>
): ReactNode => {
  return <BarChart {...props} />;
};

// Pie chart renderer with proper constraint
export const renderPieChart = <T extends Record<string, string | number>>(
  props: PieChartRendererProps<T>
): ReactNode => {
  return <PieChart {...props} />;
};

export const renderLineChart = <T,>(
  props: LineChartRendererProps<T>
): ReactNode => {
  return <LineChart {...props} />;
};

// Specialized GroupedPoint renderers
export const renderGroupedBarChart = (
  data: GroupedPoint[],
  title: string,
  barColor: string,
  customProps?: Partial<BarChartRendererProps<GroupedPoint>>
): ReactNode => {
  return renderBarChart({
    data,
    xKey: "label",
    yKey: "count",
    title,
    barColor,
    ...defaultBarProps,
    ...customProps,
  });
};

// Use the same type casting approach as in your config
export const renderGroupedPieChart = (
  data: GroupedPoint[],
  title: string,
  colors: string[],
  customProps?: Partial<PieChartRendererProps<Record<string, string | number>>>
): ReactNode => {
  return renderPieChart({
    data: data as unknown as Record<string, string | number>[],
    nameKey: "label",
    valueKey: "count",
    title,
    colors,
    ...defaultPieProps,
    ...customProps,
  });
};

export const renderGroupedLineChart = (
  data: GroupedPoint[],
  title: string,
  lineColor: string,
  customProps?: Partial<LineChartRendererProps<GroupedPoint>>
): ReactNode => {
  return renderLineChart({
    data,
    xKey: "label",
    yKey: "count",
    title,
    lineColor,
    ...defaultLineProps,
    ...customProps,
  });
};