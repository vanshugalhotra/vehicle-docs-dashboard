"use client";

import React from "react";
import clsx from "clsx";
import { AppInput } from "@/components/ui/AppInput";
import { AppText } from "@/components/ui/AppText";
import { componentTokens } from "@/styles/design-system";

export interface FilterNumberRangeProps {
  label?: string;
  value?: { min?: number; max?: number };
  onChange: (val: { min?: number; max?: number }) => void;
  placeholderMin?: string;
  placeholderMax?: string;
  className?: string;
}

export const FilterNumberRange: React.FC<FilterNumberRangeProps> = ({
  label,
  value,
  onChange,
  placeholderMin = "Min",
  placeholderMax = "Max",
  className,
}) => {
  const handleChange = (key: "min" | "max", val: string) => {
    const num = val === "" ? undefined : Number(val);
    onChange({ ...value, [key]: isNaN(num!) ? undefined : num });
  };

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      {label && (
        <AppText size="label" className={componentTokens.text.primary}>
          {label}
        </AppText>
      )}
      <div className="flex items-center gap-2">
        <AppInput
          type="number"
          placeholder={placeholderMin}
          value={value?.min ?? ""}
          onChange={(e) => handleChange("min", e.target.value)}
          className="w-1/2"
        />
        <AppText size="label" className="text-gray-400">
          –
        </AppText>
        <AppInput
          type="number"
          placeholder={placeholderMax}
          value={value?.max ?? ""}
          onChange={(e) => handleChange("max", e.target.value)}
          className="w-1/2"
        />
      </div>
    </div>
  );
};
