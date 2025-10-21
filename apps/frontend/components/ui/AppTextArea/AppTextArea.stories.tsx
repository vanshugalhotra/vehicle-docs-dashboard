import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { AppTextArea } from "./AppTextArea";

const meta: Meta<typeof AppTextArea> = {
  title: "UI/AppTextArea",
  component: AppTextArea,
};

export default meta;
type Story = StoryObj<typeof AppTextArea>;

export const Default: Story = {
  render: () => {
    const Example = () => {
      const [value, setValue] = useState("");
      return (
        <AppTextArea
          label="Description"
          placeholder="Type here..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    };
    return <Example />;
  },
};

export const WithError: Story = {
  render: () => {
    const Example = () => {
      const [value, setValue] = useState("");
      return (
        <AppTextArea
          label="Description"
          placeholder="Type here..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          error="This field is required"
        />
      );
    };
    return <Example />;
  },
};

export const Disabled: Story = {
  render: () => (
    <AppTextArea
      label="Description"
      placeholder="Disabled input"
      disabled
      value="Can't edit"
    />
  ),
};
