"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppText } from "../AppText";

interface AppTableContainerProps {
  title?: string;
  children: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}

export const AppTableContainer: FC<AppTableContainerProps> = ({
  title,
  children,
  toolbar,
  className,
}) => {
  return (
    <div
      className={clsx(
        componentTokens.card.base,
        componentTokens.table.content, // Overflow for table scroll
        className
      )}
    >
      {(title || toolbar) && (
        <div className={componentTokens.table.header}>
          {title && (
            <AppText size="heading3">
              {title}
            </AppText>
          )}
          {toolbar && <div className={componentTokens.table.toolbar}>{toolbar}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};