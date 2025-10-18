import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { typography } from "../../tokens/designTokens";

interface AppTextProps {
  children: ReactNode;
  size?: keyof typeof typography;
  className?: string;
}

export const AppText: FC<AppTextProps> = ({
  children,
  size = "md",
  className,
}) => {
  return <span className={clsx(typography[size], className)}>{children}</span>;
};
