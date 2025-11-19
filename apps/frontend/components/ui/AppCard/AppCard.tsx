"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";
import { AppText } from "../AppText";

interface AppCardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  bordered?: boolean;
  padded?: boolean;
}

export const AppCard: FC<AppCardProps> = ({
  title,
  subtitle,
  actions,
  children,
  className,
  hoverable = false,
  bordered = true,
  padded = true,
}) => {
  return (
    <div
      className={clsx(
        "flex flex-col bg-white",
        componentTokens.card.base,
        bordered && "border border-border",
        hoverable && componentTokens.card.hover,
        className
      )}
    >
      {(title || actions) && (
        <div
          className={clsx(componentTokens.card.header, !padded && "px-0 pt-0")}
        >
          <div className={componentTokens.card.titleSection}>
            {title && (
              <AppText
                as="h3"
                size="heading3"
                className={componentTokens.text.primary}
              >
                {title}
              </AppText>
            )}
            {subtitle && (
              <AppText size="label" className={componentTokens.text.bodySecondary}>
                {subtitle}
              </AppText>
            )}
          </div>
          {actions && (
            <div className="shrink-0">{actions}</div>
          )}
        </div>
      )}

      <div className={clsx(padded && componentTokens.card.content)}>
        {children}
      </div>
    </div>
  );
};
