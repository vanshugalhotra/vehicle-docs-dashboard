"use client";

import React, { ReactNode, useCallback, useRef } from "react";
import clsx from "clsx";

export interface TabItem {
  key: string | number;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string | number;
  onChange: (key: string | number) => void;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "underline" | "pills" | "enclosed";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey,
  onChange,
  className,
  tabClassName,
  activeTabClassName,
  orientation = "horizontal",
  variant = "default",
  size = "md",
  fullWidth = false,
  disabled = false,
}) => {
  const isVertical = orientation === "vertical";
  const containerRef = useRef<HTMLDivElement>(null);

  const baseTabClasses = clsx(
    "inline-flex items-center justify-center whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
    fullWidth && "flex-1",
    size === "sm" && "px-3 py-1.5 text-sm",
    size === "md" && "px-4 py-2 text-base",
    size === "lg" && "px-6 py-3 text-lg",
    tabClassName
  );

  const getVariantClasses = (isActive: boolean) => {
    const common = "transition-all duration-200 ease-out relative overflow-hidden";

    switch (variant) {
      case "underline":
        return clsx(
          common,
          "border-b-2 border-transparent hover:border-primary/30",
          isActive && "border-primary text-primary font-semibold"
        );
      case "pills":
        return clsx(
          common,
          "rounded-full border border-transparent hover:border-primary/30",
          isActive && "bg-primary/10 border-primary text-primary font-semibold"
        );
      case "enclosed":
        return clsx(
          common,
          "rounded-lg border border-border-subtle hover:border-primary/30 shadow-sm",
          isActive && "bg-primary/5 border-primary text-primary font-semibold shadow-md"
        );
      default:
        return clsx(
          common,
          "rounded-md border border-transparent hover:bg-primary/5",
          isActive && "bg-primary/10 text-primary font-semibold"
        );
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const focusableTabs = Array.from(
        containerRef.current.querySelectorAll<HTMLButtonElement>(
          'button[role="tab"]:not(:disabled)'
        )
      );
      const currentIndex = focusableTabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      if (currentIndex === -1) return;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const next = focusableTabs[(currentIndex + 1) % focusableTabs.length];
        next.focus();
        next.click();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const prev = focusableTabs[(currentIndex - 1 + focusableTabs.length) % focusableTabs.length];
        prev.focus();
        prev.click();
      }
    },
    []
  );

  return (
    <div
      role="tablist"
      aria-orientation={isVertical ? "vertical" : "horizontal"}
      className={clsx("flex", isVertical ? "flex-col space-y-1 border-r border-border-subtle" : "space-x-1 border-b border-border-subtle", className)}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const tabDisabled = disabled || item.disabled;

        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={tabDisabled}
            disabled={tabDisabled}
            onClick={() => !tabDisabled && onChange(item.key)}
            className={clsx(
              baseTabClasses,
              getVariantClasses(isActive),
              activeTabClassName && isActive && activeTabClassName
            )}
          >
            <div className="flex items-center gap-2">
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              {item.label}
            </div>
          </button>
        );
      })}
    </div>
  );
};