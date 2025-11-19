"use client";
import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Legend,
  TooltipProps as RechartsTooltipProps,
} from "recharts";
import { ChartContainer } from "../core/ChartContainer";
import { chartTheme } from "../core/ChartTheme";
import { DefaultTooltip, TooltipProps } from "../core/ChartToolTip";
import { VerticalGradient } from "../core/ChartGradient";

interface BarChartProps<T extends Record<string, string | number>> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  title?: string;
  description?: string;
  barColor?: string;
  gradient?: boolean;
  grid?: boolean;
  tooltip?: boolean;
  legend?: boolean;
  height?: number;
  width?: number | string;
  animate?: boolean;
  hoverEffect?: boolean;
  rounded?: boolean;
  showLabels?: boolean;
  customTooltip?: (props: TooltipProps) => React.ReactNode;
}

export const BarChart = <T extends Record<string, string | number>>({
  data,
  xKey,
  yKey,
  title,
  description,
  barColor = "#4f46e5",
  gradient = true,
  grid = true,
  tooltip = true,
  legend = false,
  height = 400,
  width = "100%",
  animate = true,
  hoverEffect = true,
  rounded = true,
  customTooltip,
}: BarChartProps<T>) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // --------------------------
  // Properly typed content prop
  // --------------------------
  const tooltipContent = React.useCallback(
    (props: RechartsTooltipProps<number, string>) => {
      return customTooltip ? (
        customTooltip(props as TooltipProps)
      ) : (
        <DefaultTooltip {...(props as TooltipProps)} />
      );
    },
    [customTooltip]
  );

  return (
    <ChartContainer
      width={width}
      height={height}
      title={title}
      description={description}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 20, right: legend ? 30 : 20, left: 20, bottom: 20 }}
        >
          <defs>
            {gradient && <VerticalGradient id="barGradient" color={barColor} />}
          </defs>

          {grid && (
            <CartesianGrid
              strokeDasharray={chartTheme.grid.strokeDasharray}
              stroke={chartTheme.grid.stroke}
              strokeOpacity={chartTheme.grid.strokeOpacity}
              vertical={false}
            />
          )}

          <XAxis
            dataKey={xKey as string}
            stroke={chartTheme.axis.stroke}
            tick={chartTheme.axis.tick}
            tickLine={false}
            axisLine={{ stroke: chartTheme.axis.stroke, strokeWidth: 1 }}
          />

          <YAxis
            stroke={chartTheme.axis.stroke}
            tick={chartTheme.axis.tick}
            tickLine={false}
            axisLine={{ stroke: chartTheme.axis.stroke, strokeWidth: 1 }}
            tickFormatter={(value) =>
              typeof value === "number" ? value.toLocaleString() : String(value)
            }
          />

          {tooltip && (
            <Tooltip
              content={tooltipContent}
              cursor={{ fill: barColor, opacity: 0.05, radius: 8 }}
            />
          )}

          {legend && (
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: "16px" }}
            />
          )}

          <Bar
            dataKey={yKey as string}
            name={yKey as string}
            fill={gradient ? "url(#barGradient)" : barColor}
            radius={rounded ? [8, 8, 0, 0] : 0}
            maxBarSize={60}
            animationDuration={animate ? 800 : 0}
            animationEasing="ease-out"
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {hoverEffect &&
              data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={gradient ? "url(#barGradient)" : barColor}
                  opacity={
                    hoveredIndex === null || hoveredIndex === index ? 1 : 0.6
                  }
                  style={{ transition: "all 0.3s ease", cursor: "pointer" }}
                />
              ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
