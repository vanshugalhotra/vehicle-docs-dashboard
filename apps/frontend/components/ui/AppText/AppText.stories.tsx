import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppText } from "./AppText";

const meta: Meta<typeof AppText> = {
  title: "UI/AppText",
  component: AppText,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: [
        "sm",
        "md",
        "lg",
        "xl",
        "heading1",
        "heading2",
        "heading3",
        "label",
      ],
    },
    variant: {
      control: "select",
      options: ["primary", "secondary", "muted", "error", "success"],
    },
    as: {
      control: "select",
      options: ["span", "p", "h1", "h2", "h3", "label"],
    },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof AppText>;

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <AppText size="sm">Small Text</AppText>
      <AppText size="md">Medium Text</AppText>
      <AppText size="lg">Large Text</AppText>
      <AppText size="xl">XL Text</AppText>
      <AppText size="heading1" as="h1">
        Heading 1
      </AppText>
      <AppText size="heading2" as="h2">
        Heading 2
      </AppText>
      <AppText size="heading3" as="h3">
        Heading 3
      </AppText>
      <AppText size="label" as="label">
        Form Label
      </AppText>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <AppText variant="primary">Primary</AppText>
      <AppText variant="secondary">Secondary</AppText>
      <AppText variant="muted">Muted</AppText>
      <AppText variant="error">Error</AppText>
      <AppText variant="success">Success</AppText>
    </div>
  ),
};
