import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { radius, shadow } from "../../tokens/designTokens";

interface AppCardProps {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const AppCard: FC<AppCardProps> = ({ title, children, actions, className }) => {
  return (
    <div className={clsx("bg-white p-4", radius.md, shadow.md, className)}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-3">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
