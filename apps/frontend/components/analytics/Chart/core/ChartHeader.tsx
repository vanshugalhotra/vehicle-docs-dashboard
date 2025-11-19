import React from "react";
import { chartTheme } from "./ChartTheme";

export const ChartHeader = ({
  title,
  description,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
}) => {
  if (!title && !description) return null;
  return (
    <div
      style={{
        padding: chartTheme.header.padding,
        borderBottom: chartTheme.header.borderBottom,
        marginBottom: 16,
      }}
    >
      {title && (
        <h3
          style={{
            margin: 0,
            marginBottom: description ? 4 : 0,
            ...chartTheme.header.title,
          }}
        >
          {title}
        </h3>
      )}
      {description && (
        <p style={{ margin: 0, ...chartTheme.header.desc }}>{description}</p>
      )}
    </div>
  );
};
