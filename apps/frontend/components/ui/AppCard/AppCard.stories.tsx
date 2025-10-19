import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppCard } from "./AppCard";
import { AppButton } from "../AppButton";

const meta: Meta<typeof AppCard> = {
  title: "UI/AppCard",
  component: AppCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AppCard>;

export const Default: Story = {
  args: {
    title: "Card Title",
    subtitle: "Optional subtitle text",
    children: <p>This is the content of the card.</p>,
  },
};

export const WithActions: Story = {
  args: {
    title: "Card With Actions",
    subtitle: "Header with a button",
    children: <p>Content with a button in the header.</p>,
    actions: (
      <AppButton variant="primary" size="sm">
        Action
      </AppButton>
    ),
  },
};

export const Hoverable: Story = {
  args: {
    title: "Hoverable Card",
    children: <p>Hover to see shadow elevation.</p>,
    hoverable: true,
  },
};

export const NoHeader: Story = {
  args: {
    children: <p>This card has no title or actions.</p>,
  },
};
