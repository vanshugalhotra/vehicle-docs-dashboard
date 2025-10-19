"use client";
import React, { ReactNode } from "react";
import clsx from "clsx";
import { radius, shadow } from "../../tokens/designTokens";

interface PageWrapperProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  title,
  actions,
  children,
  className,
}) => {
  return (
    <div className={clsx("flex-1 flex flex-col", className)}>
      {title && (
        <div className={clsx("flex items-center justify-between mb-4 px-6 py-4 bg-white", shadow.sm, radius.md)}>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="flex-1 px-6 py-4">{children}</div>
    </div>
  );
};
