import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AppTableContainer } from "./AppTableContainer";
import { AppButton } from "../AppButton";

const meta: Meta<typeof AppTableContainer> = {
  title: "UI/AppTableContainer",
  component: AppTableContainer,
};
export default meta;
type Story = StoryObj<typeof AppTableContainer>;

export const Default: Story = {
  args: {
    title: "Users Table",
    children: (
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-2">John Doe</td>
            <td className="p-2">john@example.com</td>
          </tr>
          <tr className="border-b">
            <td className="p-2">Jane Smith</td>
            <td className="p-2">jane@example.com</td>
          </tr>
        </tbody>
      </table>
    ),
  },
};

export const WithToolbar: Story = {
  args: {
    title: "Users Table with Toolbar",
    toolbar: (
      <div className="flex gap-2">
        <AppButton variant="primary" size="sm">Add User</AppButton>
        <AppButton variant="secondary" size="sm">Export</AppButton>
      </div>
    ),
    children: (
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Email</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-2">John Doe</td>
            <td className="p-2">john@example.com</td>
          </tr>
          <tr className="border-b">
            <td className="p-2">Jane Smith</td>
            <td className="p-2">jane@example.com</td>
          </tr>
        </tbody>
      </table>
    ),
  },
};
