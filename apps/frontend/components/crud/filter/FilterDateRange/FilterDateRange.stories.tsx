import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FilterDateRange } from "./FilterDateRange";
import type { FilterDateRangeProps } from "./FilterDateRange";

const meta: Meta<typeof FilterDateRange> = {
  title: "Filters/FilterDateRange",
  component: FilterDateRange,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    helperText: { control: "text" },
    disabled: { control: "boolean" },
    debounceMs: { control: "number" },
    clearable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof FilterDateRange>;

// Interactive wrapper to demonstrate debouncing
const InteractiveFilterWrapper = (
  args: Omit<FilterDateRangeProps, "start" | "end" | "onChange">
) => {
  const [range, setRange] = useState<{
    start?: string | null;
    end?: string | null;
  }>({});
  const [log, setLog] = useState<string[]>([]);

  const handleChange = (newRange: {
    start?: string | null;
    end?: string | null;
  }) => {
    setRange(newRange);
    const startStr = newRange.start
      ? new Date(newRange.start).toLocaleDateString()
      : "null";
    const endStr = newRange.end
      ? new Date(newRange.end).toLocaleDateString()
      : "null";
    setLog((prev) => [...prev, `Range: ${startStr} → ${endStr}`]);
  };

  return (
    <div className="space-y-4">
      <FilterDateRange
        {...args}
        start={range.start}
        end={range.end}
        onChange={handleChange}
      />
      <div className="text-sm text-gray-600">
        <p>
          <strong>Current range:</strong>
        </p>
        <p>
          Start:{" "}
          {range.start ? new Date(range.start).toLocaleDateString() : "Not set"}
        </p>
        <p>
          End:{" "}
          {range.end ? new Date(range.end).toLocaleDateString() : "Not set"}
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

// Component for pre-filled examples
const PreFilledFilterWrapper = ({
  initialStart,
  initialEnd,
  label,
  helperText,
}: {
  initialStart?: string;
  initialEnd?: string;
  label?: string;
  helperText?: string;
}) => {
  const [range, setRange] = useState<{
    start?: string | null;
    end?: string | null;
  }>({
    start: initialStart,
    end: initialEnd,
  });

  return (
    <div className="space-y-4">
      <FilterDateRange
        label={label}
        start={range.start}
        end={range.end}
        onChange={setRange}
        helperText={helperText}
      />
      <div className="text-sm text-gray-600">
        <p>
          <strong>Current range:</strong>
        </p>
        <p>
          Start:{" "}
          {range.start ? new Date(range.start).toLocaleDateString() : "Not set"}
        </p>
        <p>
          End:{" "}
          {range.end ? new Date(range.end).toLocaleDateString() : "Not set"}
        </p>
      </div>
    </div>
  );
};

export const Default: Story = {
  args: {
    label: "Date Range",
    helperText: "Select a date range to filter results",
  },
};

export const WithCustomDebounce: Story = {
  render: () => (
    <InteractiveFilterWrapper
      label="Date Range"
      debounceMs={1000}
      helperText="1 second debounce - notice the delay when changing dates"
    />
  ),
};

export const WithoutDebounce: Story = {
  render: () => (
    <InteractiveFilterWrapper
      label="Date Range"
      debounceMs={0}
      helperText="Immediate updates - may cause performance issues"
    />
  ),
};

export const WithInitialValues: Story = {
  render: () => (
    <PreFilledFilterWrapper
      initialStart="2024-01-01T00:00:00.000Z"
      initialEnd="2024-12-31T00:00:00.000Z"
      label="Pre-filled Range"
      helperText="Starts with a pre-defined date range"
    />
  ),
};

export const Disabled: Story = {
  args: {
    label: "Date Range",
    disabled: true,
    helperText: "This date range filter is currently disabled",
  },
};

export const NotClearable: Story = {
  args: {
    label: "Date Range",
    clearable: false,
    helperText: "No clear button - must manually reset dates",
  },
};

export const Compact: Story = {
  args: {
    helperText: "Compact date range picker without label",
  },
};

export const OnlyStartDate: Story = {
  render: () => (
    <PreFilledFilterWrapper
      initialStart="2024-06-01T00:00:00.000Z"
      label="From Date"
      helperText="Only start date is set"
    />
  ),
};

export const OnlyEndDate: Story = {
  render: () => (
    <PreFilledFilterWrapper
      initialEnd="2024-12-31T00:00:00.000Z"
      label="To Date"
      helperText="Only end date is set"
    />
  ),
};
