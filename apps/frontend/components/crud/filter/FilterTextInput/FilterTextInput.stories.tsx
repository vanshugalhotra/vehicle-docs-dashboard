import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FilterTextInput } from "./FilterTextInput";
import type { FilterTextInputProps } from "./FilterTextInput";

const meta: Meta<typeof FilterTextInput> = {
  title: "Filters/FilterTextInput",
  component: FilterTextInput,
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
    label: { control: "text" },
    helperText: { control: "text" },
    disabled: { control: "boolean" },
    debounceMs: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof FilterTextInput>;

// Interactive wrapper to demonstrate debouncing
const InteractiveFilterWrapper = (
  args: Omit<FilterTextInputProps, "value" | "onChange">
) => {
  const [value, setValue] = useState("");
  const [log, setLog] = useState<string[]>([]);

  const handleChange = (val: string) => {
    setValue(val);
    setLog((prev) => [...prev, `Changed: "${val}"`]);
  };

  return (
    <div className="space-y-4">
      <FilterTextInput {...args} value={value} onChange={handleChange} />
      <div className="text-sm text-gray-600">
        <p>
          <strong>Current value:</strong> &quot;{value}&quot;
        </p>
        <p>
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

export const Default: Story = {
  args: {
    label: "Search",
    placeholder: "Type to filter...",
    helperText: "Results will update as you type",
  },
};

export const WithCustomDebounce: Story = {
  render: () => (
    <InteractiveFilterWrapper
      label="Quick Search"
      placeholder="Try typing fast..."
      debounceMs={1000}
      helperText="1 second debounce - notice the delay"
    />
  ),
};

export const WithoutDebounce: Story = {
  render: () => (
    <InteractiveFilterWrapper
      label="Instant Search"
      placeholder="No debounce..."
      debounceMs={0}
      helperText="Immediate updates - may cause performance issues"
    />
  ),
};

export const Disabled: Story = {
  args: {
    label: "Disabled Filter",
    placeholder: "Cannot type here",
    disabled: true,
    helperText: "This filter is currently disabled",
  },
};

export const WithInitialValue: Story = {
  render: () => (
    <InteractiveFilterWrapper
      label="Pre-filled Filter"
      placeholder="Type to override..."
      helperText="Starts with a pre-filled value"
    />
  ),
};

export const Compact: Story = {
  args: {
    label: "Compact Search",
    placeholder: "Minimal interface...",
    helperText: "Compact filter for tight spaces",
  },
};
