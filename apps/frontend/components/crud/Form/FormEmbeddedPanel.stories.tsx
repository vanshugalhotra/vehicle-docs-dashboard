import type { Meta, StoryObj } from "@storybook/react";
import { FormEmbeddedPanel } from "./FormEmbeddedPanel";
import { EntityField } from "./EntityFieldTypes";

const fields: EntityField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "licensePlate", label: "License Plate", type: "text", required: true },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: [
      { label: "Truck", value: "truck" },
      { label: "Car", value: "car" },
    ],
  },
  { key: "notes", label: "Notes", type: "textarea" },
  { key: "purchaseDate", label: "Purchase Date", type: "date" },
];

const meta: Meta<typeof FormEmbeddedPanel> = {
  title: "Forms/FormEmbeddedPanel",
  component: FormEmbeddedPanel,
  parameters: { layout: "centered" },
  args: {
    title: "Add Vehicle",
    fields,
    onSubmit: (values) => alert(JSON.stringify(values, null, 2)),
  },
};

export default meta;
type Story = StoryObj<typeof FormEmbeddedPanel>;

export const Default: Story = {};

export const SplitLayout: Story = {
  args: {
    layout: {
      gridColumns: 2,
    },
  },
};

export const EditMode: Story = {
  args: {
    selectedRecord: {
      name: "Volvo Truck",
      licensePlate: "MH12AB1234",
      category: "truck",
      notes: "Existing vehicle record",
      purchaseDate: new Date(),
    },
  },
};
