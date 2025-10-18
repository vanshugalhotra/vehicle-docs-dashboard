import React, { FC, ReactNode } from "react";
import clsx from "clsx";
import { radius, transition } from "../../tokens/designTokens";

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
  return (
    <div className={clsx("flex flex-col w-full mb-4", className)}>
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>
      )}
      <div
        className={clsx(
          "w-full",
          radius.sm,          // consistent rounded corners
          transition.base          // smooth transition for any child changes
        )}
      >
        {children}
      </div>
      {error && (
        <span className="text-red-500 text-sm mt-1">{error}</span>
      )}
    </div>
  );
};
