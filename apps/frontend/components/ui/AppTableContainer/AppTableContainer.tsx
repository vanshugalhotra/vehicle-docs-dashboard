"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { radius, shadow, transition, theme } from "../../tokens/designTokens";
import { AppText } from "../AppText";

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
  const t = theme.light; // light mode for now

  return (
    <div
      className={clsx(
        "bg-white p-4",
        radius.md,
        shadow.md,
        transition.base,
        className
      )}
    >
      {(title || toolbar) && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          {title && (
            <AppText
              size="heading3"
              className={clsx(t.colors.textPrimary)}
            >
              {title}
            </AppText>
          )}
          {toolbar && <div>{toolbar}</div>}
        </div>
      )}
      <div className="overflow-auto">{children}</div>
    </div>
  );
};
