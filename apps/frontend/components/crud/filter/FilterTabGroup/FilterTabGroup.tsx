"use client";

import React from "react";
import { Tabs } from "@/components/layout/tab/Tab";
import { FilterOption } from "@/lib/types/filter.types";

interface FilterTabGroupProps {
  label?: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export const FilterTabGroup: React.FC<FilterTabGroupProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      {label && (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-1">
          {label}
        </span>
      )}

      <div className="w-full overflow-x-auto scrollbar-hide">
        <Tabs
          items={options.map((o) => ({
            key: o.value,
            label: (
              <div className="flex items-center gap-2">
                {o.icon && <span className="shrink-0 text-base">{o.icon}</span>}
                <span className="whitespace-nowrap">{o.label}</span>
                {o.count !== undefined && o.count > 0 && (
                  <span className="ml-1 text-xs bg-primary/15 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full font-semibold min-w-7">
                    {o.count}
                  </span>
                )}
              </div>
            ),
            icon: undefined, // Moved to label for better alignment
          }))}
          activeKey={value}
          onChange={(key) => onChange(String(key))}
          variant="enclosed"
          size="md"
          fullWidth={true}
          className="min-w-max bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-1 border-0!"
          tabClassName="flex-1 justify-center rounded-lg transition-all duration-200"
          activeTabClassName="bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600"
        />
      </div>
    </div>
  );
};