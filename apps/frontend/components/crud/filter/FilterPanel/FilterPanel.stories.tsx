import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FilterPanel } from "./FilterPanel";
import type { FilterPanelProps } from "./FilterPanel";

interface FilterFieldConfig {
  key: string;
  label: string;
  type: "text" | "select" | "dateRange";
  placeholder?: string;
  options?: { label: string; value: string }[];
  startKey?: string;
  endKey?: string;
  dependsOn?: { key: string };
}

const meta: Meta<typeof FilterPanel> = {
  title: "Filters/FilterPanel",
  component: FilterPanel,
  tags: ["autodocs"],
  argTypes: {
    compact: { control: "boolean" },
    isLoading: { control: "boolean" },
    debounceMs: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof FilterPanel>;

// Sample field configurations
const textFields: FilterFieldConfig[] = [
  {
    key: "search",
    label: "Search",
    type: "text",
    placeholder: "Search by name...",
  },
  {
    key: "email",
    label: "Email",
    type: "text",
    placeholder: "Filter by email...",
  },
];

const selectFields: FilterFieldConfig[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status...",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Pending", value: "pending" },
    ],
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    placeholder: "Select category...",
    options: [
      { label: "Electronics", value: "electronics" },
      { label: "Clothing", value: "clothing" },
      { label: "Books", value: "books" },
    ],
  },
];

const dateRangeFields: FilterFieldConfig[] = [
  {
    key: "created",
    label: "Created Date",
    type: "dateRange",
    startKey: "created_start",
    endKey: "created_end",
  },
  {
    key: "updated",
    label: "Updated Date",
    type: "dateRange",
    startKey: "updated_start",
    endKey: "updated_end",
  },
];

const mixedFields: FilterFieldConfig[] = [
  {
    key: "search",
    label: "Search",
    type: "text",
    placeholder: "Search...",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status...",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
  {
    key: "date_range",
    label: "Date Range",
    type: "dateRange",
    startKey: "start_date",
    endKey: "end_date",
  },
];

// Interactive wrapper component
const InteractiveFilterPanel: React.FC<
  Omit<FilterPanelProps, "filters" | "onChange">
> = (args) => {
  const [filters, setFilters] = useState({});
  const [log, setLog] = useState<string[]>([]);

  const handleChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
    setLog((prev) => [...prev, `Filters: ${JSON.stringify(newFilters)}`]);
  };

  const handleReset = () => {
    setFilters({});
    setLog((prev) => [...prev, "Filters reset"]);
  };

  return (
    <div className="space-y-4">
      <FilterPanel
        {...args}
        filters={filters}
        onChange={handleChange}
        onReset={handleReset}
      />
      <div className="text-sm text-gray-600">
        <p>
          <strong>Current filters:</strong> {JSON.stringify(filters)}
        </p>
        <p className="mt-2">
          <strong>Change log:</strong>
        </p>
        <ul className="max-h-32 overflow-y-auto border rounded p-2 mt-1">
          {log.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Many filters component
const ManyFiltersPanel: React.FC = () => {
  const [filters, setFilters] = useState({});
  const [log, setLog] = useState<string[]>([]);

  const manyFields: FilterFieldConfig[] = Array.from({ length: 6 }, (_, i) => ({
    key: `filter_${i + 1}`,
    label: `Filter ${i + 1}`,
    type: "text" as const,
    placeholder: `Type to filter ${i + 1}...`,
  }));

  const handleChange = (newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
    setLog((prev) => [...prev, `Filters: ${JSON.stringify(newFilters)}`]);
  };

  return (
    <div className="space-y-4">
      <FilterPanel
        fields={manyFields}
        filters={filters}
        onChange={handleChange}
        onReset={() => setFilters({})}
        compact={false}
      />
      <div className="text-sm text-gray-600">
        <p>
          <strong>Current filters:</strong> {JSON.stringify(filters)}
        </p>
        <p className="mt-2">
          <strong>Change log:</strong>
        </p>
        <ul className="max-h-32 overflow-y-auto border rounded p-2 mt-1">
          {log.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const TextFilters: Story = {
  render: () => <InteractiveFilterPanel fields={textFields} compact={false} />,
};

export const SelectFilters: Story = {
  render: () => (
    <InteractiveFilterPanel fields={selectFields} compact={false} />
  ),
};

export const DateRangeFilters: Story = {
  render: () => (
    <InteractiveFilterPanel fields={dateRangeFields} compact={false} />
  ),
};

export const MixedFilters: Story = {
  render: () => <InteractiveFilterPanel fields={mixedFields} compact={false} />,
};

export const CompactMode: Story = {
  render: () => <InteractiveFilterPanel fields={mixedFields} compact={true} />,
};

export const WithCustomDebounce: Story = {
  render: () => (
    <InteractiveFilterPanel
      fields={textFields}
      compact={false}
      debounceMs={1000}
    />
  ),
};

export const ManyFilters: Story = {
  render: () => <ManyFiltersPanel />,
};
