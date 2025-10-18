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

const optionsDefault: Option[] = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
  { label: "Option 3", value: "3" },
];

const optionsWithAdd: Option[] = [
  { label: "Category A", value: "a" },
  { label: "Category B", value: "b" },
];

export const Default: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<Option | undefined>(optionsDefault[0]);
      return <AppSelect options={optionsDefault} value={value} onChange={setValue} />;
    };
    return <Wrapper />;
  },
};

export const WithAdd: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<Option | undefined>(undefined);
      return <AppSelect options={optionsWithAdd} value={value} onChange={setValue} allowAdd />;
    };
    return <Wrapper />;
  },
};
