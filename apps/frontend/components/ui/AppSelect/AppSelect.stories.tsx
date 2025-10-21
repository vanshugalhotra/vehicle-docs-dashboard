import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppSelect, Option } from "./AppSelect";

const meta: Meta<typeof AppSelect> = {
  title: "UI/AppSelect",
  component: AppSelect,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof AppSelect>;

const sampleOptions: Option[] = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
  { label: "Option 3", value: "3" },
];

export const Default: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<Option | undefined>();
      return (
        <AppSelect
          label="Category"
          placeholder="Select category..."
          options={sampleOptions}
          value={value}
          onChange={setValue}
        />
      );
    };
    return <Wrapper />;
  },
};

export const WithErrorAndHelper: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<Option | undefined>();
      return (
        <AppSelect
          label="Type"
          placeholder="Choose type..."
          options={sampleOptions}
          value={value}
          onChange={setValue}
          helperText="Select a type from the list."
          error={!value ? "Selection required" : ""}
        />
      );
    };
    return <Wrapper />;
  },
};

export const WithAddOption: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<Option | undefined>();
      return (
        <AppSelect
          label="Vehicle Category"
          options={sampleOptions}
          value={value}
          onChange={setValue}
          allowAdd
        />
      );
    };
    return <Wrapper />;
  },
};
