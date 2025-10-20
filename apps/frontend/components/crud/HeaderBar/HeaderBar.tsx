"use client";

import React, { FC } from "react";
import clsx from "clsx";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { transition } from "../../tokens/designTokens";

interface HeaderBarProps {
  title: string;
  onAdd?: () => void;
  showAddButton?: boolean;
  filters?: React.ReactNode;
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
        "flex flex-col sm:flex-row sm:items-center justify-between gap-2",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <AppText size="heading1" className="font-bold">
          {title}
        </AppText>

        {filters && <div className="flex gap-2">{filters}</div>}
      </div>

      {showAddButton && onAdd && (
        <AppButton
          variant="primary"
          onClick={onAdd}
          className={transition.base}
        >
          Add {title}
        </AppButton>
      )}
    </div>
  );
};

export default HeaderBar;
