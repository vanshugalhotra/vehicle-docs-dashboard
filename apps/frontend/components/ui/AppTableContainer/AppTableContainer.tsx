import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { radius, shadow } from "../../tokens/designTokens";

interface AppTableContainerProps {
  title?: string;
  children: ReactNode; // table body or custom content
  toolbar?: ReactNode; // filters, buttons, search
  className?: string;
}

export const AppTableContainer: FC<AppTableContainerProps> = ({
  title,
  children,
  toolbar,
  className,
}) => {
  return (
    <div className={clsx("bg-white p-4", radius.md, shadow.md, className)}>
      {(title || toolbar) && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {toolbar && <div>{toolbar}</div>}
        </div>
      )}
      <div className="overflow-auto">{children}</div>
    </div>
  );
};
