"use client";

import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppText } from "@/components/ui/AppText";
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
  children?: ReactNode;
}

export const Topbar: FC<TopbarProps> = ({
  title,
  actions,
  children,
  showShadow = false,
}) => {
  return (
    <header
      className={clsx(
        componentTokens.topbar.base,
        showShadow && componentTokens.topbar.shadow,
        "backdrop-blur-sm bg-surface/95 border-b border-border-subtle/50"
      )}
    >
      {/* Left: Title */}
      <div className={clsx(
        componentTokens.topbar.titleSection,
        "flex items-center gap-4 pr-6 border-r border-border-subtle/20"
      )}>
        {title && (
          <AppText 
            as="h1" 
            size="heading1" 
            className="font-bold text-text-primary drop-shadow-sm"
          >
            {title}
          </AppText>
        )}
      </div>

      {/* Right: Actions */}
      <div className={clsx(
        componentTokens.topbar.actionsSection,
        "flex items-center gap-3 pl-6"
      )}>
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