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
import { AppInput } from "../AppInput";

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
    extraParams: { take: 15 },
    selectedValue: value,
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
    <div className={clsx("flex flex-col gap-2", className)}>
      {label && (
        <AppText size="label" variant="primary">
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
              aria-invalid={!!error}
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
                  className="px-2 pb-2"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <AppInput
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="text-caption w-full mt-2"
                    onFocus={(e) => e.stopPropagation()}
                  />
                </div>

                {isError && (
                  <div className="flex items-center justify-between px-3 py-2 text-caption text-danger-text">
                    Failed to load
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        refetch();
                      }}
                      className={clsx(componentTokens.button.ghost, "text-sm")}
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
                      <div className="px-3 py-2 text-caption text-text-tertiary">
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
                      componentTokens.select.addNew,
                      "border-t border-border-subtle"
                    )}
                  >
                    + Add new
                  </button>
                )}
              </ListboxOptions>
            )}

            {isLoading && (
              <div className="absolute inset-y-0 right-3 flex items-center">
                <Loader2 className="animate-spin h-4 w-4 text-text-tertiary" />
              </div>
            )}
          </div>
        </Listbox>
      </div>
    </div>
  );
};
