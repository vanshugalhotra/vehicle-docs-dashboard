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
  showShadow = true,
}) => {
  return (
    <header
      className={clsx(
        componentTokens.topbar.base,
        showShadow && componentTokens.topbar.shadow
      )}
    >
      {/* Left: Title */}
      <div className={componentTokens.topbar.titleSection}>
        {title && (
          <AppText as="h1" size="heading3">
            {title}
          </AppText>
        )}
      </div>

      {/* Right: Actions */}
      <div className={componentTokens.topbar.actionsSection}>
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