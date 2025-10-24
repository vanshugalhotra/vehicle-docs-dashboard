"use client";

import React, { useState, useMemo, useRef } from "react";
import clsx from "clsx";
import { ChevronDown, Loader2, RotateCw } from "lucide-react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { AppText } from "../AppText";
import { componentTokens } from "@/styles/design-system";
import { Option } from "./AppSelect";
import { useAsyncOptions } from "@/hooks/useAsyncOptions";

export interface AppAsyncSelectProps<T = unknown> {
  endpoint: string;
  value?: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  filterBy?: { key: string; value?: string };
  transform?: (data: T[]) => Option[];
  allowAdd?: boolean;
  className?: string;
  onAddClick?: () => void;
}

export const AppAsyncSelect = <T,>({
  endpoint,
  value,
  onChange,
  label,
  placeholder = "Select...",
  error,
  disabled = false,
  filterBy,
  transform,
  allowAdd = false,
  className,
  onAddClick,
}: AppAsyncSelectProps<T>) => {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { options, isLoading, isError, refetch } = useAsyncOptions<T>({
    endpoint,
    search,
    filterBy,
    transform,
    extraParams: { take: 4 },
    selectedValue: value
  });

  const selectedOption = useMemo(() => {
    const found = options.find((opt) => opt.value === value);
    if (found) return found;
    // fallback: if value exists but not in options, show temporary label
    if (value)
      return {
        value,
        label: "Loading...",
      };
    return undefined;
  }, [options, value]);

  const placeholderOption: Option = { label: placeholder, value: "" };

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      {label && (
        <AppText size="label" className={componentTokens.text.primary}>
          {label}
        </AppText>
      )}

      <div className="relative w-full">
        <Listbox
          value={selectedOption ?? placeholderOption}
          onChange={(opt: Option) => onChange(opt.value)}
          disabled={disabled || isLoading}
        >
          <div className="relative w-full">
            <ListboxButton
              className={clsx(
                componentTokens.select.button,
                error && componentTokens.input.error,
                disabled && componentTokens.input.disabled
              )}
            >
              <span
                className={clsx(
                  selectedOption ? "" : componentTokens.select.placeholder
                )}
              >
                {isLoading
                  ? "Loading..."
                  : selectedOption?.label || placeholder}
              </span>
              <ChevronDown className={componentTokens.select.icon} />
            </ListboxButton>

            {!isLoading && (
              <ListboxOptions className={componentTokens.select.options}>
                <div
                  className="px-2 pb-1"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full text-sm px-2 py-1 border rounded-md outline-none focus:ring-1 focus:ring-primary"
                    onFocus={(e) => e.stopPropagation()}
                  />
                </div>

                {isError && (
                  <div className="flex items-center justify-between px-3 py-2 text-sm text-red-500">
                    Failed to load
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        refetch();
                      }}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <RotateCw className="h-3 w-3" /> Retry
                    </button>
                  </div>
                )}

                {!isError && options.length > 0
                  ? options.map((opt) => (
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
                    ))
                  : !isError && (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No options found
                      </div>
                    )}

                {allowAdd && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddClick?.();
                    }}
                    className={clsx(
                      "w-full text-left px-3 py-2 text-sm font-medium text-primary hover:bg-accent",
                      "border-t border-gray-100 mt-1"
                    )}
                  >
                    + Add new
                  </button>
                )}
              </ListboxOptions>
            )}

            {isLoading && (
              <div className="absolute inset-y-0 right-3 flex items-center">
                <Loader2 className="animate-spin h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
        </Listbox>
      </div>
    </div>
  );
};
