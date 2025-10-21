"use client";

import React from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppTooltip } from "@/components/ui/AppTooltip";
import { AppButton } from "@/components/ui/AppButton";

interface TopbarActionProps {
  icon: React.ElementType;
  tooltip?: string;
  onClick?: () => void;
}

export const TopbarAction: React.FC<TopbarActionProps> = ({
  icon: Icon,
  tooltip,
  onClick,
}) => {
  const button = (
    <AppButton
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={clsx(
        "h-9 w-9 p-0", // Compact square for topbar icons
        componentTokens.text.secondary, // Muted icon color
        "hover:text-primary" // Primary on hover for energy
      )}
      aria-label={tooltip}
    >
      <Icon size={18} />
    </AppButton>
  );

  return tooltip ? <AppTooltip content={tooltip}>{button}</AppTooltip> : button;
};