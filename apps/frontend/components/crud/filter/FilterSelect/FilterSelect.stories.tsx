import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FilterSelect } from "./FilterSelect";
import type { FilterSelectProps } from "./FilterSelect";
import type { Option } from "@/components/ui/AppSelect";

const meta: Meta<typeof FilterSelect> = {
  title: "Filters/FilterSelect",
  component: FilterSelect,
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
    label: { control: "text" },
    helperText: { control: "text" },
    disabled: { control: "boolean" },
    debounceMs: { control: "number" },
    clearable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof FilterSelect>;

// Sample options for stories
const statusOptions: Option[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

const categoryOptions: Option[] = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books" },
  { value: "home", label: "Home & Garden" },
];

const userOptions: Option[] = [
  { value: "john", label: "John Doe" },
  { value: "jane", label: "Jane Smith" },
  { value: "bob", label: "Bob Johnson" },
  { value: "alice", label: "Alice Brown" },
];

// Interactive wrapper to demonstrate debouncing
const InteractiveFilterWrapper = (
  args: Omit<FilterSelectProps, "value" | "onChange" | "options"> & {
    options: Option[];
  }
) => {
  const [value, setValue] = useState("");
  const [log, setLog] = useState<string[]>([]);

  const handleChange = (val: string) => {
    setValue(val);
    setLog((prev) => [...prev, `Changed: "${val}"`]);
  };

  return (
    <div className="space-y-4">
      <FilterSelect {...args} value={value} onChange={handleChange} />
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
    label: "Status",
    options: statusOptions,
    placeholder: "Select status...",
    helperText: "Filter by status",
  },
};

export const WithCustomDebounce: Story = {
  render: () => (
    <InteractiveFilterWrapper
      label="Category"
      options={categoryOptions}
      placeholder="Select category..."
      debounceMs={1000}
      helperText="1 second debounce - notice the delay"
    />
  ),
};

export const WithoutDebounce: Story = {
  render: () => (
    <InteractiveFilterWrapper
      label="User"
      options={userOptions}
      placeholder="Select user..."
      debounceMs={0}
      helperText="Immediate updates"
    />
  ),
};

export const WithInitialValue: Story = {
  render: () => (
    <InteractiveFilterWrapper
      label="Status"
      options={statusOptions}
      placeholder="Select status..."
      helperText="Starts with a pre-selected value"
    />
  ),
};

export const Disabled: Story = {
  args: {
    label: "Category",
    options: categoryOptions,
    placeholder: "Cannot select...",
    disabled: true,
    helperText: "This filter is currently disabled",
  },
};

export const NotClearable: Story = {
  args: {
    label: "User",
    options: userOptions,
    placeholder: "Select user...",
    clearable: false,
    helperText: "No clear button - selection is permanent",
  },
};

export const LongOptions: Story = {
  render: () => {
    const longOptions: Option[] = [
      {
        value: "1",
        label:
          "Very long option name that might wrap to multiple lines in the dropdown",
      },
      {
        value: "2",
        label:
          "Another extremely lengthy option description that demonstrates text truncation",
      },
      { value: "3", label: "Short" },
    ];

    return (
      <InteractiveFilterWrapper
        label="Long Options"
        options={longOptions}
        placeholder="Select an option..."
        helperText="Demonstrates handling of long option labels"
      />
    );
  },
};

export const ManyOptions: Story = {
  render: () => {
    const manyOptions: Option[] = Array.from({ length: 20 }, (_, i) => ({
      value: `option-${i + 1}`,
      label: `Option ${i + 1}`,
    }));

    return (
      <InteractiveFilterWrapper
        label="Many Options"
        options={manyOptions}
        placeholder="Scroll to see more..."
        helperText="Demonstrates scrolling with many options"
      />
    );
  },
};
