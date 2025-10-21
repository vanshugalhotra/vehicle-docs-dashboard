import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppSheet } from "./AppSheet";
import { AppButton } from "../AppButton";

const meta: Meta<typeof AppSheet> = {
  title: "UI/AppSheet",
  component: AppSheet,
};
export default meta;
type Story = StoryObj<typeof AppSheet>;

export const Default: Story = {
  render: () => {
    const Wrapper = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <AppButton onClick={() => setOpen(true)}>Open Sheet</AppButton>
          <AppSheet open={open} onClose={() => setOpen(false)} title="Slide-over Panel">
            <p>This is the content inside the sheet.</p>
            <p>It can scroll if content is long.</p>
          </AppSheet>
        </>
      );
    };
    return <Wrapper />;
  },
};

export const SmallSize: Story = {
  render: () => {
    const Wrapper = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <AppButton onClick={() => setOpen(true)}>Open Small Sheet</AppButton>
          <AppSheet open={open} onClose={() => setOpen(false)} title="Small Sheet" size="sm">
            <p>Small width sheet content.</p>
          </AppSheet>
        </>
      );
    };
    return <Wrapper />;
  },
};
