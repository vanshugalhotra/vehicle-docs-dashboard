"use client";

import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps as RechartsTooltipProps,
} from "recharts";

import { ChartContainer } from "../core/ChartContainer";
import { chartTheme } from "../core/ChartTheme";
import { DefaultTooltip, TooltipProps } from "../core/ChartToolTip";

interface PieChartProps<T extends Record<string, string | number>> {
  data: T[];
  nameKey: keyof T;
  valueKey: keyof T;

  title?: string;
  description?: string;

  colors?: string[];
  gradient?: boolean;
  tooltip?: boolean;
  legend?: boolean;

  height?: number;
  width?: number | string;
  animate?: boolean;
  hoverEffect?: boolean;
  innerRadius?: number;

  customTooltip?: (props: TooltipProps) => React.ReactNode;
}

export const PieChart = <T extends Record<string, string | number>>({
  data,
  nameKey,
  valueKey,
  title,
  description,

  colors = chartTheme.pie?.colors ?? [
    "#4f46e5",
    "#6366f1",
    "#a5b4fc",
    "#c7d2fe",
    "#e0e7ff",
  ],
  gradient = true,
  tooltip = true,
  legend = true,

  height = 400,
  width = "100%",
  animate = true,
  hoverEffect = true,
  innerRadius = 60,
  customTooltip,
}: PieChartProps<T>) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const tooltipContent = React.useCallback(
    (props: RechartsTooltipProps<number, string>) => {
      const p = props as TooltipProps;
      if (!p.active || !p.payload || !p.payload.length) return null;

      const total = data.reduce(
        (sum, entry) => sum + Number(entry[valueKey]),
        0
      );
      const item = p.payload[0];
      const value = Number(item.value);
      const percent = total ? ((value / total) * 100).toFixed(1) : "0";

      // Create updated payload with percentage value
      const updatedProps = {
        ...p,
        payload: [
          {
            ...item,
            value: `${percent}%`,
            payload: item.payload,
            dataKey: item.dataKey,
          },
        ],
      };

      return customTooltip ? (
        customTooltip(updatedProps)
      ) : (
        <DefaultTooltip {...updatedProps} />
      );
    },
    [data, valueKey, customTooltip]
  );

  const hoverOpacity = chartTheme.pie?.hoverOpacity ?? 0.6;

  const transition = chartTheme.pie?.transition ?? "opacity 0.25s ease";

  const legendIconSize = chartTheme.pie?.legend?.iconSize ?? 10;

  const legendPadding = chartTheme.pie?.legend?.topPadding ?? 12;

  return (
    <ChartContainer
      width={width}
      height={height}
      title={title}
      description={description}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          {/* Gradients */}
          <defs>
            {gradient &&
              colors.map((color, index) => (
                <linearGradient
                  key={index}
                  id={`pieGradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                </linearGradient>
              ))}
          </defs>

          {/* Tooltip */}
          {tooltip && <Tooltip content={tooltipContent} />}

          {/* Legend */}
          {legend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconSize={legendIconSize}
              iconType="circle"
              wrapperStyle={{ paddingTop: legendPadding }}
            />
          )}

          {/* Pie */}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            dataKey={valueKey as string}
            nameKey={nameKey as string}
            innerRadius={innerRadius}
            outerRadius={90}
            paddingAngle={2}
            cornerRadius={8}
            animationDuration={animate ? 900 : 0}
            label={({ value }) => {
              const total = data.reduce(
                (sum, entry) => sum + Number(entry[valueKey]),
                0
              );
              const percent = total
                ? ((Number(value) / total) * 100).toFixed(0)
                : "0";
              return `${percent}%`;
            }}
          >
            {data.map((_, index) => {
              const color = colors[index % colors.length];
              const fill = gradient ? `url(#pieGradient-${index})` : color;

              return (
                <Cell
                  key={index}
                  fill={fill}
                  opacity={
                    hoverEffect
                      ? hoveredIndex === null || hoveredIndex === index
                        ? 1
                        : hoverOpacity
                      : 1
                  }
                  onMouseEnter={() => hoverEffect && setHoveredIndex(index)}
                  onMouseLeave={() => hoverEffect && setHoveredIndex(null)}
                  style={{
                    cursor: hoverEffect ? "pointer" : "default",
                    transition,
                  }}
                />
              );
            })}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
