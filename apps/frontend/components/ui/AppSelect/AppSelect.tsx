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
import { componentTokens } from "@/styles/design-system";
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
  className?: string;
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
  className
}) => {
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      {label && (
        <AppText size="label" className={componentTokens.text.primary}>
          {label}
        </AppText>
      )}

      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className={"relative w-full"}>
          <ListboxButton
            className={clsx(
              componentTokens.select.button,
              error && componentTokens.input.error,
              disabled && componentTokens.input.disabled
            )}
          >
            <span className={clsx(value ? "" : componentTokens.select.placeholder)}>
              {value ? value.label : placeholder}
            </span>
            <ChevronDown className={componentTokens.select.icon} />
          </ListboxButton>

          <ListboxOptions className={componentTokens.select.options}>
            {options.map((opt) => (
              <ListboxOption
                key={opt.value}
                value={opt}
                className={({ active, selected }) =>
                  clsx(
                    componentTokens.select.option,
                    selected && componentTokens.select.optionSelected,
                    active && componentTokens.select.optionActive
                  )
                }
              >
                {opt.label}
              </ListboxOption>
            ))}

            {allowAdd && (
              <div className={componentTokens.select.addNew}>
                + Add new
              </div>
            )}
          </ListboxOptions>
        </div>
      </Listbox>

      {error ? (
        <AppText size="body" className={componentTokens.text.error} variant="error">
          {error}
        </AppText>
      ) : (
        helperText && (
          <AppText size="body" className={componentTokens.text.bodySecondary}>
            {helperText}
          </AppText>
        )
      )}
    </div>
  );
};