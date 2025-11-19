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
} from "recharts";

interface LineChartProps<T extends Record<string, string | number>> {
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
  hoverEffect?: boolean;
  showLabels?: boolean;
  customTooltip?: (props: TooltipProps) => React.ReactNode;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: string | number;
    payload: Record<string, string | number>;
    dataKey: string;
  }>;
  label?: string;
}

export const LineChart = <T extends Record<string, string | number>>({
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
  // Custom tooltip component with proper typing
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (customTooltip) {
      return customTooltip({ active, payload, label });
    }

    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(8px)",
          }}
        >
          <p
            style={{
              color: "#6b7280",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px",
            }}
          >
            {label}
          </p>
          <p
            style={{
              color: "#1f2937",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            {typeof payload[0].value === "number"
              ? payload[0].value.toLocaleString()
              : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate chart height considering title and description
  const chartHeight = height - (title ? 60 : 0) - (description ? 30 : 0);

  return (
    <div
      style={{
        width,
        height,
        minWidth: 400,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header Section */}
      {(title || description) && (
        <div
          style={{
            padding: "0 24px 16px 24px",
            borderBottom: "1px solid #f3f4f6",
            marginBottom: "16px",
          }}
        >
          {title && (
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#111827",
                margin: 0,
                marginBottom: description ? "4px" : 0,
              }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {description}
            </p>
          )}
        </div>
      )}

      {/* Chart Container */}
      <div
        style={{
          position: "relative",
          height: chartHeight,
          padding: "0 24px 24px 24px",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
            margin={{
              top: 20,
              right: legend ? 30 : 20,
              left: 20,
              bottom: 20,
            }}
          >
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.8} />
                <stop offset="50%" stopColor={lineColor} stopOpacity={1} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0.8} />
              </linearGradient>
            </defs>

            {/* Grid with subtle styling */}
            {grid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#d1d5db"
                strokeOpacity={0.3}
                vertical={false}
              />
            )}

            {/* X Axis */}
            <XAxis
              dataKey={xKey as string}
              stroke="#9ca3af"
              tick={{
                fill: "#6b7280",
                fontSize: 12,
                fontWeight: 500,
              }}
              tickLine={false}
              axisLine={{
                stroke: "#e5e7eb",
                strokeWidth: 1,
              }}
            />

            {/* Y Axis */}
            <YAxis
              stroke="#9ca3af"
              tick={{
                fill: "#6b7280",
                fontSize: 12,
                fontWeight: 500,
              }}
              tickLine={false}
              axisLine={{
                stroke: "#e5e7eb",
                strokeWidth: 1,
              }}
              tickFormatter={(value) =>
                typeof value === "number" ? value.toLocaleString() : value
              }
            />

            {/* Tooltip */}
            {tooltip && (
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: lineColor,
                  opacity: 0.05,
                  radius: 8,
                }}
              />
            )}

            {/* Legend */}
            {legend && (
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  paddingBottom: "16px",
                }}
              />
            )}

            {/* Line */}
            <Line
              type="monotone"
              dataKey={yKey as string}
              name={yKey as string}
              stroke={gradient ? "url(#lineGradient)" : lineColor}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={{
                fill: gradient ? lineColor : "white",
                stroke: lineColor,
                strokeWidth: 2,
                r: 5,
              }}
              activeDot={{
                r: 8,
                fill: "white",
                stroke: lineColor,
                strokeWidth: 3,
              }}
              animationDuration={animate ? 1000 : 0}
              animationEasing="ease-out"
              connectNulls={false}
              isAnimationActive={animate}
            />
          </RechartsLineChart>
        </ResponsiveContainer>

        {/* Decorative bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "24px",
            right: "24px",
            height: "2px",
            background: `linear-gradient(to right, transparent, ${lineColor}, transparent)`,
            opacity: 0.3,
            transition: "opacity 0.5s ease",
            borderRadius: "0 0 16px 16px",
          }}
        />
      </div>
    </div>
  );
};
