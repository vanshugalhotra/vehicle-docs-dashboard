// components/ui/AppTooltip.tsx
"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { transition } from "../../tokens/designTokens";

/**
 * Simple tooltip (CSS-only)
 * - Works without extra runtime deps
 * - Shows on hover and focus
 * - Accepts content (string | ReactNode) and children (trigger)
 *
 * Note: This is intentionally minimal. Replace with Radix/Tippy if you need
 * advanced features (arrow, delay, interactive, positioning).
 */

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
  // basic placement mapping to tailwind classes
  const contentPos = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  }[placement];

  return (
    <span className={clsx("relative inline-block", className)}>
      {/* trigger — ensure it can receive focus */}
      <span className="group inline-flex items-center">{children}</span>

      {/* tooltip panel */}
      <span
        role="tooltip"
        className={clsx(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md px-2 py-1 text-xs bg-gray-900 text-white text-center opacity-0 scale-95 transform transition-all duration-150 ease-in-out",
          transition,
          contentPos,
          "group-hover:opacity-100 group-focus-within:opacity-100 group-hover:scale-100 group-focus-within:scale-100"
        )}
      >
        {content}
      </span>
    </span>
  );
};

export default AppTooltip;
