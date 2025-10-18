import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppBadge} from "./AppBadge";

const meta: Meta<typeof AppBadge> = {
  title: "UI/AppBadge",
  component: AppBadge,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["neutral", "success", "warning", "danger"] },
    children: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof AppBadge>;

export const Default: Story = {
  args: {
    children: "Neutral Badge",
    variant: "neutral",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2">
      <AppBadge variant="neutral">Neutral</AppBadge>
      <AppBadge variant="success">Success</AppBadge>
      <AppBadge variant="warning">Warning</AppBadge>
      <AppBadge variant="danger">Danger</AppBadge>
    </div>
  ),
};
