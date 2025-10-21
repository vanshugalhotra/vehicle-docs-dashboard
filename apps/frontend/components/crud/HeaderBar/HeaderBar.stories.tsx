import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import HeaderBar from "./HeaderBar";
import { AppButton } from "@/components/ui/AppButton";

const meta: Meta<typeof HeaderBar> = {
  title: "CRUD/HeaderBar",
  component: HeaderBar,
};

export default meta;
type Story = StoryObj<typeof HeaderBar>;

export const Default: Story = {
  args: {
    title: "Vehicles",
    onAdd: () => alert("Add button clicked!"),
    showAddButton: true,
  },
};

export const WithFilters: Story = {
  args: {
    title: "Vehicles",
    showAddButton: true,
    onAdd: () => alert("Add button clicked!"),
    filters: (
      <>
        <AppButton variant="outline" onClick={() => alert("Filter clicked")}>
          Filter
        </AppButton>
        <input
          type="text"
          placeholder="Search..."
          className="px-2 py-1 border rounded"
        />
      </>
    ),
  },
};
