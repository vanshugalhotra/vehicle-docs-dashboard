import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppButton } from "./AppButton";

const meta: Meta<typeof AppButton> = {
  title: "UI/AppButton",
  component: AppButton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "outline", "ghost", "danger", "link"],
    },
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof AppButton>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <AppButton variant="primary">Primary</AppButton>
      <AppButton variant="secondary">Secondary</AppButton>
      <AppButton variant="outline">Outline</AppButton>
      <AppButton variant="ghost">Ghost</AppButton>
      <AppButton variant="danger">Danger</AppButton>
      <AppButton variant="link">Link</AppButton>
    </div>
  ),
};
