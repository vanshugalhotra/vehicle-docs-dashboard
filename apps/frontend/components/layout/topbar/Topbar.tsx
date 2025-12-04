"use client";

import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppText } from "@/components/ui/AppText";

interface TopbarProps {
  title?: string;
  showShadow?: boolean;
  children?: ReactNode;
  /** Custom actions to render on the right side */
  rightActions?: ReactNode;
}

export const Topbar: FC<TopbarProps> = ({
  title,
  children,
  rightActions,
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
      <div
        className={clsx(
          componentTokens.topbar.titleSection,
          "flex items-center gap-4 pr-6 border-r border-border-subtle/20"
        )}
      >
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

      {/* Center: Children (custom content) */}
      {children && (
        <div className="flex items-center flex-1 px-6">{children}</div>
      )}

      {/* Right: Actions */}
      {rightActions || children ? (
        <div
          className={clsx(
            componentTokens.topbar.actionsSection,
            "flex items-center gap-3 pl-6",
            !children && "ml-auto"
          )}
        >
          {rightActions}
        </div>
      ) : null}
    </header>
  );
};
