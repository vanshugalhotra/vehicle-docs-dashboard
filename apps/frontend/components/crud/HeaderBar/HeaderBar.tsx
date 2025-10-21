"use client";

import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";

interface HeaderBarProps {
  title: string;
  onAdd?: () => void;
  showAddButton?: boolean;
  filters?: ReactNode;
  className?: string;
}

export const HeaderBar: FC<HeaderBarProps> = ({
  title,
  onAdd,
  showAddButton = true,
  filters,
  className,
}) => {
  return (
    <div
      className={clsx(
        componentTokens.layout.section, // Reusable section padding/gap
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        className
      )}
    >
      <div className={componentTokens.layout.pageHeader}>
        <AppText size="heading1" className="font-bold">
          {title}
        </AppText>

        {filters && <div className={componentTokens.layout.pageHeaderActions}>{filters}</div>}
      </div>

      {showAddButton && onAdd && (
        <AppButton
          variant="primary"
          onClick={onAdd}
          size="md"
          className="shrink-0"
        >
          Add {title}
        </AppButton>
      )}
    </div>
  );
};

export default HeaderBar;