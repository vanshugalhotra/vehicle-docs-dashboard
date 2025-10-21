import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ConfirmDialog } from "./ConfirmDialog";
import { AppButton } from "@/components/ui/AppButton";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Components/ConfirmDialog",
  component: ConfirmDialog,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

const DefaultStoryComponent = () => {
  const [open, setOpen] = useState(false); 

  const handleConfirm = () => {
    alert("Confirmed!");
    setOpen(false);
  };

  const handleCancel = () => {
    alert("Cancelled!");
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <AppButton variant="primary" onClick={() => setOpen(true)}>
        Open Confirm Dialog
      </AppButton>

      <ConfirmDialog
        open={open}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Delete Vehicle"
        description="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        size="sm"
      />
    </div>
  );
};

export const Default: Story = {
  render: DefaultStoryComponent,
};
