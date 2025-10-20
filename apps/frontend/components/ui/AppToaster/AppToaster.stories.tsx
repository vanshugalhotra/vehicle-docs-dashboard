import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppToaster } from "./AppToaster";
import { AppButton } from "../AppButton";
import { toast } from "sonner";

const meta: Meta<typeof AppToaster> = {
  title: "UI/AppToaster",
  component: AppToaster,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof AppToaster>;

export const Showcase: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-3 p-6">
      <AppToaster />
      <AppButton onClick={() => toast.success("This is a success message!")}>
        Success Toast
      </AppButton>
      <AppButton
        variant="outline"
        onClick={() => toast.error("Something went wrong!")}
      >
        Error Toast
      </AppButton>
      <AppButton
        variant="secondary"
        onClick={() => toast.info("This is an info toast.")}
      >
        Info Toast
      </AppButton>
      <AppButton variant="ghost" onClick={() => toast.warning("Be careful!")}>
        Warning Toast
      </AppButton>
      <AppButton
        variant="primary"
        onClick={() =>
          toast.promise(
            new Promise((resolve, reject) =>
              setTimeout(
                () => (Math.random() > 0.5 ? resolve("ok") : reject()),
                1500
              )
            ),
            {
              loading: "Processing...",
              success: "Done successfully!",
              error: "Something failed!",
            }
          )
        }
      >
        Promise Toast
      </AppButton>
    </div>
  ),
};
