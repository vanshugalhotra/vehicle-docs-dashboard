"use client";
import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { componentTokens } from "@/styles/design-system";

type TextSize = keyof typeof componentTokens.text['sizes'] | 'bodySecondary'; // Union for autocomplete; add more semantics as needed

interface AppTextProps {
  children: ReactNode;
  size?: TextSize;
  variant?: "primary" | "secondary" | "muted" | "error" | "success";
  as?: React.ElementType;
  className?: string;
}

const getSizeClass = (size: TextSize): string => {
  if (size === 'bodySecondary') return componentTokens.text.bodySecondary;
  return componentTokens.text.sizes[size] || componentTokens.text.sizes.body;
};

const variantClasses = {
  primary: componentTokens.text.primary,
  secondary: componentTokens.text.secondary,
  muted: componentTokens.text.muted,
  error: componentTokens.text.error,
  success: componentTokens.text.success,
} as const;

export const AppText: FC<AppTextProps> = ({
  children,
  size = "body",
  variant = "primary",
  as: Tag = "span",
  className,
}) => {
  return (
    <Tag
      className={clsx(
        getSizeClass(size),
        variantClasses[variant],
        className
      )}
    >
      {children}
    </Tag>
  );
};