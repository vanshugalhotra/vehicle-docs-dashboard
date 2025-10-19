"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import {
  radius,
  transition,
  typography,
  theme,
} from "../../tokens/designTokens";

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
  const t = theme.light; // using light mode for now

  // placement mapping to tailwind classes
  const contentPos = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  }[placement];

  return (
    <span className={clsx("relative inline-block", className)}>
      {/* trigger */}
      <span className="group inline-flex items-center">{children}</span>

      {/* tooltip panel */}
      <span
        role="tooltip"
        className={clsx(
          "pointer-events-none absolute z-50 whitespace-nowrap px-2 py-1 text-center",
          radius.sm,
          typography.sm,
          t.colors.surface, // fallback background
          "bg-gray-900 text-white", // tooltip background color
          transition.base,
          "opacity-0 scale-95 transform",
          "group-hover:opacity-100 group-focus-within:opacity-100 group-hover:scale-100 group-focus-within:scale-100",
          contentPos
        )}
      >
        {content}
      </span>
    </span>
  );
};

export default AppTooltip;
