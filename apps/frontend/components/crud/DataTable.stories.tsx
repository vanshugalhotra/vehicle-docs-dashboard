import type { Meta, StoryObj } from "@storybook/react";
import { DataTable, DataTableProps } from "./DataTable";
import { ColumnDef } from "@tanstack/react-table";

interface Vehicle {
  id: number;
  name: string;
  licensePlate: string;
  category: string;
}

const columns: ColumnDef<Vehicle>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "licensePlate", header: "License Plate" },
  { accessorKey: "category", header: "Category" },
];

const sampleData: Vehicle[] = [
  { id: 1, name: "Truck A", licensePlate: "CH01AB1234", category: "Truck" },
  { id: 2, name: "Car B", licensePlate: "CH01CD5678", category: "Car" },
  { id: 3, name: "Mini Truck", licensePlate: "CH01EF9012", category: "Truck" },
];

const meta: Meta<DataTableProps<Vehicle>> = {
  title: "CRUD/DataTable",
  component: DataTable,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Reusable DataTable component using TanStack Table v8 with optional edit/delete actions.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<DataTableProps<Vehicle>>;

// 🧱 Default Table
export const Default: Story = {
  args: {
    columns,
    data: sampleData,
  },
  name: "Default",
};

// ⏳ Loading State
export const Loading: Story = {
  args: {
    columns,
    data: [],
    loading: true,
  },
  name: "Loading",
};

// 🙁 Empty State
export const Empty: Story = {
  args: {
    columns,
    data: [],
  },
  name: "Empty",
};

// ✏️ With Actions (Edit/Delete)
export const WithActions: Story = {
  args: {
    columns,
    data: sampleData,
    onEdit: (row) => alert(`Edit ${row.name}`),
    onDelete: (row) => alert(`Delete ${row.name}`),
  },
  name: "With Actions",
};
