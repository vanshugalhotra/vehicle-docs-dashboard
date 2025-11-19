"use client";

import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: string | number;
    payload: Record<string, string | number>;
    dataKey: string;
  }>;
  label?: string;
}

export const PieChart = <T extends Record<string, string | number>>({
  data,
  nameKey,
  valueKey,
  title,
  description,
  colors = ["#4f46e5", "#6366f1", "#a5b4fc", "#c7d2fe", "#e0e7ff"],
  tooltip = true,
  legend = true,
  height = 400,
  width = "100%",
  animate = true,
  innerRadius = 60,
  customTooltip,
}: PieChartProps<T>) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Custom tooltip component
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

  const chartHeight = height - (title ? 60 : 0) - (description ? 30 : 0);

  return (
    <div
      style={{
        width,
        height,
        minWidth: 400,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            {/* Add gradient definitions */}
            <defs>
              {colors.map((color, index) => (
                <linearGradient
                  key={`pieGradient-${index}`}
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
            {tooltip && <Tooltip content={<CustomTooltip />} />}

            {/* Legend */}
            {legend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={10}
              />
            )}

            {/* Pie */}
            <Pie
              data={data}
              dataKey={valueKey as string}
              nameKey={nameKey as string}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={innerRadius}
              paddingAngle={2}
              cornerRadius={8}
              animationDuration={animate ? 800 : 0}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.7}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};