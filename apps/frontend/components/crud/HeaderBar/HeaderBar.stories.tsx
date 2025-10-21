import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { HeaderBar } from "./HeaderBar";
import { AppButton } from "@/components/ui/AppButton";

const meta: Meta<typeof HeaderBar> = {
  title: "CRUD/HeaderBar",
  component: HeaderBar,
};

export default meta;
type Story = StoryObj<typeof HeaderBar>;

// Create proper React components for each story
const DefaultHeaderBar = () => {
  const [search, setSearch] = useState("");
  return (
    <HeaderBar
      title="Vehicles"
      search={search}
      onSearchChange={setSearch}
    />
  );
};

const HeaderBarWithFilters = () => {
  const [search, setSearch] = useState("");
  return (
    <HeaderBar
      title="Vehicles"
      search={search}
      onSearchChange={setSearch}
    >
      <AppButton
        variant="outline"
        onClick={() => alert("Filter clicked")}
      >
        Filter
      </AppButton>
      <input
        type="text"
        placeholder="Extra search..."
        className="px-2 py-1 border rounded"
      />
    </HeaderBar>
  );
};

const HeaderBarEditingMode = () => {
  const [search, setSearch] = useState("");
  return (
    <HeaderBar
      title="Vehicles"
      search={search}
      onSearchChange={setSearch}
      isEditing={true}
      onCancelEdit={() => alert("Cancelled edit")}
    />
  );
};

export const Default: Story = {
  render: () => <DefaultHeaderBar />,
};

export const WithFilters: Story = {
  render: () => <HeaderBarWithFilters />,
};

export const EditingMode: Story = {
  render: () => <HeaderBarEditingMode />,
};