"use client";

import React from "react";
import { AppTooltip } from "@/components/ui/AppTooltip";
import { AppButton } from "@/components/ui/AppButton";
import { transition } from "../../tokens/designTokens";

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
      className={`p-2 text-gray-600 hover:text-gray-900 ${transition.base}`}
      onClick={onClick}
      aria-label={tooltip}
    >
      <Icon size={18} />
    </AppButton>
  );

  return tooltip ? <AppTooltip content={tooltip}>{button}</AppTooltip> : button;
};
