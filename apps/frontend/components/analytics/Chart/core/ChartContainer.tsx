import React from "react";
import { ChartHeader } from "./ChartHeader";
import { chartTheme } from "./ChartTheme";

export const ChartContainer = ({
  width = "100%",
  height = 400,
  title,
  description,
  minWidth = 400,
  children,
}: {
  width?: number | string;
  height?: number;
  minWidth?: number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const chartHeight = height - (title ? 60 : 0) - (description ? 30 : 0);
  return (
    <div style={{ width, height, minWidth, fontFamily: chartTheme.fontFamily }}>
      <ChartHeader title={title} description={description} />

      <div
        style={{
          position: "relative",
          height: chartHeight,
          padding: "0 24px 24px 24px",
        }}
      >
        {children}
      </div>
    </div>
  );
};
