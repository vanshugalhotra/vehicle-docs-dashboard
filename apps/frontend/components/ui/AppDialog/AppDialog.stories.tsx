import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppDialog } from "./AppDialog";
import { AppButton } from "../AppButton";

const meta: Meta<typeof AppDialog> = {
  title: "UI/AppDialog",
  component: AppDialog,
};
export default meta;
type Story = StoryObj<typeof AppDialog>;

export const Default: Story = {
  render: () => {
    const Wrapper = () => {
      const [open, setOpen] = useState(true);
      return (
        <>
          <AppButton onClick={() => setOpen(true)}>Open Dialog</AppButton>
          <AppDialog
            open={open}
            onClose={() => setOpen(false)}
            title="Dialog Title"
            footer={
              <>
                <AppButton variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </AppButton>
                <AppButton variant="primary">Confirm</AppButton>
              </>
            }
          >
            <p>This is the content of the modal dialog.</p>
          </AppDialog>
        </>
      );
    };
    return <Wrapper />;
  },
};

export const NoFooter: Story = {
  render: () => {
    const Wrapper = () => {
      const [open, setOpen] = useState(true);
      return (
        <>
          <AppButton onClick={() => setOpen(true)}>Open Dialog</AppButton>
          <AppDialog open={open} onClose={() => setOpen(false)} title="No Footer">
            <p>This modal has no footer buttons.</p>
          </AppDialog>
        </>
      );
    };
    return <Wrapper />;
  },
};

export const SmallSize: Story = {
  render: () => {
    const Wrapper = () => {
      const [open, setOpen] = useState(true);
      return (
        <>
          <AppButton onClick={() => setOpen(true)}>Open Small Dialog</AppButton>
          <AppDialog open={open} onClose={() => setOpen(false)} title="Small Dialog" size="sm">
            <p>Small size modal.</p>
          </AppDialog>
        </>
      );
    };
    return <Wrapper />;
  },
};
