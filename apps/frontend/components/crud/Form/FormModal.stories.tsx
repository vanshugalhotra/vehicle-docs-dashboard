"use client";

import React, { useState } from "react";
import type { Meta, StoryFn } from "@storybook/react";
import { z } from "zod";
import FormModal, { EntityField } from "./FormModal";
import { Option as AppSelectOption } from "../../ui/AppSelect";

const meta: Meta<typeof FormModal> = {
  title: "Forms/FormModal",
  component: FormModal,
};

export default meta;

const selectOptions: AppSelectOption[] = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
];

const fields: EntityField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "description", label: "Description", type: "textarea" },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: selectOptions,
  },
  { key: "dueDate", label: "Due Date", type: "date" },
];

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(), // Changed from date() to string() since date inputs typically return strings
});

const Template: StoryFn<typeof FormModal> = (args) => {
  const [open, setOpen] = useState(true);

  return (
    <FormModal
      {...args}
      open={open}
      onClose={() => setOpen(false)}
      onSubmit={(values) => {
        console.log("Submitted values:", values);
        setOpen(false);
      }}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  title: "Test Modal",
  fields: fields,
  schema: schema,
  defaultValues: {
    name: "",
    description: "",
    category: "1",
    dueDate: new Date().toISOString().split("T")[0], // Format for date input
  },
};

export const WithInitialValues = Template.bind({});
WithInitialValues.args = {
  title: "Edit Item",
  fields: fields,
  schema: schema,
  defaultValues: {
    name: "Existing Item",
    description: "This is an existing description",
    category: "2",
    dueDate: new Date().toISOString().split("T")[0],
  },
};

export const LoadingState = Template.bind({});
LoadingState.args = {
  title: "Test Modal",
  fields: fields,
  schema: schema,
  loading: true,
  defaultValues: {
    name: "",
    description: "",
    category: "1",
    dueDate: new Date().toISOString().split("T")[0],
  },
};
