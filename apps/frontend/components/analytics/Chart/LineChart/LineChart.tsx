"use client";

import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  TooltipProps as RechartsTooltipProps,
} from "recharts";

import { ChartContainer } from "../core/ChartContainer";
import { chartTheme } from "../core/ChartTheme";
import { DefaultTooltip, TooltipProps } from "../core/ChartToolTip";
import { VerticalGradient } from "../core/ChartGradient";

interface LineChartProps<T> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  title?: string;
  description?: string;
  lineColor?: string;
  gradient?: boolean;
  grid?: boolean;
  tooltip?: boolean;
  legend?: boolean;
  height?: number;
  width?: number | string;
  animate?: boolean;
  hoverEffect?: boolean; // Add missing prop
  customTooltip?: (props: TooltipProps) => React.ReactNode;
}

export const LineChart = <T,>({
  data,
  xKey,
  yKey,
  title,
  description,
  lineColor = "#4f46e5",
  gradient = true,
  grid = true,
  tooltip = true,
  legend = false,
  height = 400,
  width = "100%",
  animate = true,
  customTooltip,
}: LineChartProps<T>) => {
  const tooltipContent = React.useCallback(
    (props: RechartsTooltipProps<number, string>) =>
      customTooltip ? (
        customTooltip(props as TooltipProps)
      ) : (
        <DefaultTooltip {...(props as TooltipProps)} />
      ),
    [customTooltip]
  );

  return (
    <ChartContainer width={width} height={height} title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 20, right: legend ? 30 : 20, left: 20, bottom: 20 }}
        >
          <defs>
            {gradient && <VerticalGradient id="lineGradient" color={lineColor} />}
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
            tickFormatter={(v) => (typeof v === "number" ? v.toLocaleString() : String(v))}
          />

          {tooltip && (
            <Tooltip content={tooltipContent} cursor={{ stroke: lineColor, strokeWidth: 1, opacity: 0.2 }} />
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

          <Line
            type="monotone"
            dataKey={yKey as string}
            name={yKey as string}
            stroke={gradient ? "url(#lineGradient)" : lineColor}
            strokeWidth={3}
            dot={{
              fill: lineColor,
              stroke: "#fff",
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 7,
              fill: "#fff",
              stroke: lineColor,
              strokeWidth: 3,
            }}
            animationDuration={animate ? 900 : 0}
            animationEasing="ease-out"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};