import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppFormRow } from "./AppFormRow";
import { AppInput } from "../AppInput";

const meta: Meta<typeof AppFormRow> = {
  title: "UI/AppFormRow",
  component: AppFormRow,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    error: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof AppFormRow>;

export const Default: Story = {
  render: () => (
    <AppFormRow label="Username">
      <AppInput placeholder="Enter username" />
    </AppFormRow>
  ),
};

export const WithError: Story = {
  render: () => (
    <AppFormRow label="Username" error="This field is required">
      <AppInput placeholder="Enter username" />
    </AppFormRow>
  ),
};

export const NoLabel: Story = {
  render: () => (
    <AppFormRow>
      <AppInput placeholder="No label here" />
    </AppFormRow>
  ),
};
