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
    label: { control: "text" },
    helperText: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof AppInput>;

export const Default: Story = {
  args: {
    label: "Full Name",
    placeholder: "Enter your name...",
    helperText: "This will be displayed on your profile",
  },
};

export const WithIcons: Story = {
  render: () => (
    <AppInput
      label="Search"
      placeholder="Type to search..."
      prefixIcon={<Search size={16} />}
      helperText="Try typing something"
    />
  ),
};

export const ErrorState: Story = {
  render: () => (
    <AppInput
      label="Email"
      placeholder="Enter your email..."
      error="Invalid email address"
    />
  ),
};

export const Disabled: Story = {
  args: {
    label: "Disabled Field",
    placeholder: "Can't type here",
    disabled: true,
  },
};
