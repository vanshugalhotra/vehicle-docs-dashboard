"use client";

import React from "react";
import clsx from "clsx";
import { shadow, transition, theme } from "../../tokens/designTokens";
import { TopbarAction } from "./TopbarAction";

export interface TopbarActionItem {
  icon: React.ElementType;
  tooltip?: string;
  onClick?: () => void;
}

interface TopbarProps {
  title?: string;
  actions?: TopbarActionItem[];
  showShadow?: boolean;
  children?: React.ReactNode;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  actions,
  children,
  showShadow = true,
}) => {
  const t = theme.light;

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 flex items-center justify-between h-14 w-full px-4 sm:px-6",
        t.colors.background,
        t.colors.border ? "border-b" : "",
        showShadow && shadow.sm,
        transition.base
      )}
    >
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        {title && (
          <h1 className={`${t.typography.heading3} ${t.colors.textPrimary}`}>
            {title}
          </h1>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {actions?.map((action, i) => (
          <TopbarAction
            key={i}
            icon={action.icon}
            tooltip={action.tooltip}
            onClick={action.onClick}
          />
        ))}
        {children}
      </div>
    </header>
  );
};
