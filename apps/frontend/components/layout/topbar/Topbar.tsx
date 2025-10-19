"use client";
import React from "react";
import clsx from "clsx";
import { shadow, transition } from "../../tokens/designTokens";
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
  return (
    <header
      className={clsx(
        "sticky top-0 z-40 flex items-center justify-between h-14 w-full bg-white border-b border-gray-100",
        transition.base,
        showShadow && shadow.sm
      )}
    >
      <div className="flex items-center gap-3 px-4 sm:px-6">
        {title && (
          <h1 className="text-lg font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2 px-4 sm:px-6">
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
