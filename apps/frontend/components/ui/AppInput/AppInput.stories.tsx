import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppInput } from "./AppInput";
import { Search } from "lucide-react";

const meta: Meta<typeof AppInput> = {
  title: "UI/AppInput",
  component: AppInput,
  tags: ["autodocs"],
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof AppInput>;

export const Default: Story = {
  args: { placeholder: "Enter text..." },
};

export const WithIcons: Story = {
  render: () => (
    <AppInput
      placeholder="Search..."
      prefixIcon={<Search size={16} />}
    />
  ),
};

export const ErrorState: Story = {
  render: () => (
    <AppInput
      placeholder="Enter text..."
      error="This field is required"
    />
  ),
};
