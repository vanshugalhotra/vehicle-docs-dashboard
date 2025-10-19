"use client";
import React from "react";
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
      className="p-2 text-gray-600 hover:text-gray-900"
      onClick={onClick}
    >
      <Icon size={18} />
    </AppButton>
  );

  return tooltip ? <AppTooltip content={tooltip}>{button}</AppTooltip> : button;
};
