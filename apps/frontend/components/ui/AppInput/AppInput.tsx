import React, { FC, InputHTMLAttributes } from "react";
import clsx from "clsx";

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
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
        className={clsx("relative flex items-center", disabled && "opacity-50")}
      >
        {prefixIcon && <span className="absolute left-3">{prefixIcon}</span>}
        <input
          className={clsx(
            "w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
            prefixIcon && "pl-10",
            suffixIcon && "pr-10",
            error ? "border-red-500" : "border-gray-300",
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
