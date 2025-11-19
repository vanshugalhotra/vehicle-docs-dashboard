import React from "react";
import { chartTheme } from "./ChartTheme";

export interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: string | number;
    payload: Record<string, string | number>;
    dataKey: string;
  }>;
  label?: string | number | null;
}

export const DefaultTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        backgroundColor: chartTheme.tooltip.bg,
        border: `1px solid ${chartTheme.tooltip.border}`,
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: chartTheme.tooltip.shadow,
        backdropFilter: "blur(8px)",
      }}
    >
      <p
        style={{
          color: "#6b7280",
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: "#1f2937",
          fontSize: 18,
          fontWeight: "bold",
          margin: 0,
        }}
      >
        {typeof payload[0].value === "number"
          ? (payload[0].value as number).toLocaleString()
          : payload[0].value}
      </p>
    </div>
  );
};
