"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { radius, transition, theme } from "../../tokens/designTokens";
import { AppText } from "../AppText";

interface AppFormRowProps {
  label?: string;
  children: ReactNode;
  error?: string;
  className?: string;
}

export const AppFormRow: FC<AppFormRowProps> = ({
  label,
  children,
  error,
  className,
}) => {
  const t = theme.light; // for now focus on light mode

  return (
    <div className={clsx("flex flex-col w-full mb-4 gap-1", className)}>
      {label && (
        <AppText as="label" size="label" className={t.colors.textSecondary}>
          {label}
        </AppText>
      )}

      <div className={clsx("w-full", radius.sm, transition.base)}>
        {children}
      </div>

      {error && (
        <AppText size="sm" variant="error">
          {error}
        </AppText>
      )}
    </div>
  );
};
