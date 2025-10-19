import type { Meta, StoryObj } from "@storybook/react";
import { AppDatePicker } from "./AppDatePicker";
import { useState } from "react";

const meta: Meta<typeof AppDatePicker> = {
  title: "UI/AppDatePicker",
  component: AppDatePicker,
};

export default meta;
type Story = StoryObj<typeof AppDatePicker>;

export const Default: Story = {
  render: () => {
    const Example = () => {
      const [date, setDate] = useState<Date | null>(null);
      return (
        <AppDatePicker value={date} onChange={setDate} label="Select Date" />
      );
    };
    return <Example />;
  },
};

export const WithError: Story = {
  render: () => {
    const Example = () => {
      const [date, setDate] = useState<Date | null>(null);
      return (
        <AppDatePicker
          value={date}
          onChange={setDate}
          label="Select Date"
          error="Invalid date"
        />
      );
    };
    return <Example />;
  },
};

export const Disabled: Story = {
  render: () => {
    const Example = () => {
      const [date, setDate] = useState<Date | null>(new Date());
      return (
        <AppDatePicker
          value={date}
          onChange={setDate}
          label="Select Date"
          disabled
        />
      );
    };
    return <Example />;
  },
};
