"use client";
import React, { FC } from "react";
import clsx from "clsx";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { theme, radius, shadow, transition } from "../../tokens/designTokens";
import { AppText } from "../AppText";

export interface Option {
  label: string;
  value: string;
}

export interface AppSelectProps {
  options: Option[];
  value?: Option;
  onChange: (val: Option) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  allowAdd?: boolean;
}

export const AppSelect: FC<AppSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  helperText,
  error,
  disabled = false,
  allowAdd = false,
}) => {
  const t = theme.light;

  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <AppText size="label" className={t.colors.textSecondary}>
          {label}
        </AppText>
      )}

      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative w-full">
          <ListboxButton
            className={clsx(
              "w-full flex items-center justify-between bg-white px-3 py-2 border text-left",
              "focus:outline-none focus:ring-2",
              radius.md,
              transition.base,
              shadow.sm,
              t.colors.textPrimary,
              error ? t.colors.errorBorder : t.colors.border,
              disabled && t.colors.disabledOpacity,
              !disabled && "hover:border-gray-400 focus:ring-blue-500"
            )}
          >
            <span className={clsx(value ? "" : "text-gray-400")}>
              {value ? value.label : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
          </ListboxButton>

          <ListboxOptions
            className={clsx(
              "absolute mt-1 w-full bg-white border",
              radius.md,
              shadow.lg,
              "max-h-60 overflow-auto z-10 divide-y divide-gray-100"
            )}
          >
            {options.map((opt) => (
              <ListboxOption
                key={opt.value}
                value={opt}
                className={({ active, selected }) =>
                  clsx(
                    "cursor-pointer px-3 py-2",
                    transition.fast,
                    selected && "bg-blue-50 font-semibold text-blue-700",
                    active && "bg-blue-100"
                  )
                }
              >
                {opt.label}
              </ListboxOption>
            ))}

            {allowAdd && (
              <div className="px-3 py-2 text-blue-600 cursor-pointer hover:bg-blue-50">
                + Add new
              </div>
            )}
          </ListboxOptions>
        </div>
      </Listbox>

      {error ? (
        <AppText size="sm" className="text-red-600">
          {error}
        </AppText>
      ) : (
        helperText && (
          <AppText size="sm" className={t.colors.textSecondary}>
            {helperText}
          </AppText>
        )
      )}
    </div>
  );
};
