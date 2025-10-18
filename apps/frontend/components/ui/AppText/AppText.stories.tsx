import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppText } from "./AppText";

const meta: Meta<typeof AppText> = {
  title: "UI/AppText",
  component: AppText,
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
      <AppText size="heading1">Heading 1</AppText>
      <AppText size="heading2">Heading 2</AppText>
      <AppText size="heading3">Heading 3</AppText>
      <AppText size="label">Form Label</AppText>
    </div>
  ),
};
