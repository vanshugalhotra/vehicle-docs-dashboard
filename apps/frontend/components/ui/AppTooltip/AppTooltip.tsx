"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";

interface AppTooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  placement?: "top" | "right" | "bottom" | "left";
}

export const AppTooltip: FC<AppTooltipProps> = ({
  content,
  children,
  className,
  placement = "top",
}) => {
  // Placement mapping to Tailwind classes
  const contentPos = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  }[placement];

  return (
    <span className={clsx("relative inline-block", className)}>
      {/* Trigger */}
      <span className="group inline-flex items-center">{children}</span>

      {/* Tooltip panel */}
      <span
        role="tooltip"
        className={clsx(
          componentTokens.tooltip.panel,
          contentPos
        )}
      >
        {content}
      </span>
    </span>
  );
};

export default AppTooltip;