import React, { FC, InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { colors, radius, transition } from "../../tokens/designTokens";

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}

export const AppInput: FC<AppInputProps> = ({
  error,
  prefixIcon,
  suffixIcon,
  disabled = false,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col w-full">
      <div
        className={clsx(
          "relative flex items-center",
          disabled && colors.disabledOpacity
        )}
      >
        {prefixIcon && <span className="absolute left-3">{prefixIcon}</span>}
        <input
          className={clsx(
            "w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
            radius.md,
            transition,
            prefixIcon && "pl-10",
            suffixIcon && "pr-10",
            error ? colors.errorBorder : colors.border,
            className
          )}
          disabled={disabled}
          {...props}
        />
        {suffixIcon && <span className="absolute right-3">{suffixIcon}</span>}
      </div>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
};
