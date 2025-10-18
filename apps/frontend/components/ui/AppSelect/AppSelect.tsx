import React, { FC } from "react";
import clsx from "clsx";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { colors, radius, shadow, transition } from "../../tokens/designTokens";

export interface Option {
  label: string;
  value: string;
}

export interface AppSelectProps {
  options: Option[];
  value?: Option;
  onChange: (val: Option) => void;
  placeholder?: string;
  disabled?: boolean;
  allowAdd?: boolean;
}

export const AppSelect: FC<AppSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  allowAdd = false,
}) => {
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative w-full">
        <ListboxButton
          className={clsx(
            "w-full flex items-center justify-between border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
            radius.md,
            shadow.sm,
            transition,
            disabled && colors.disabledOpacity
          )}
        >
          {value ? value.label : placeholder}
          <ChevronDown className="ml-2 h-4 w-4" />
        </ListboxButton>

        <ListboxOptions
          className={clsx(
            "absolute mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto z-10"
          )}
        >
          {options.map((opt) => (
            <ListboxOption
              key={opt.value}
              value={opt}
              className={({ active, selected }) =>
                clsx(
                  "cursor-pointer px-3 py-2",
                  active && "bg-blue-100",
                  selected && "font-semibold"
                )
              }
            >
              {opt.label}
            </ListboxOption>
          ))}
          {allowAdd && (
            <div className="px-3 py-2 text-blue-500 cursor-pointer hover:bg-blue-50">
              + Add new
            </div>
          )}
        </ListboxOptions>
      </div>
    </Listbox>
  );
};
