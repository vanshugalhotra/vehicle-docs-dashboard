import type { Meta, StoryObj } from "@storybook/react";
import { MetricCard } from "./MetricCard";
import { Truck, FileText } from "lucide-react";

const meta: Meta<typeof MetricCard> = {
  title: "Dashboard/MetricCard",
  component: MetricCard,
};

export default meta;

type Story = StoryObj<typeof MetricCard>;

export const Default: Story = {
  args: {
    title: "Total Vehicles",
    value: 128,
    icon: <Truck className="w-5 h-5" />,
  },
};

export const Loading: Story = {
  args: {
    title: "Total Vehicles",
    loading: true,
  },
};

export const WithTrendPositive: Story = {
  args: {
    title: "Documents Pending",
    value: 42,
    icon: <FileText className="w-5 h-5" />,
    trend: {
      rate: 14,
      label: "vs last month",
    },
  },
};

export const WithTrendNegative: Story = {
  args: {
    title: "Expired Documents",
    value: 8,
    icon: <FileText className="w-5 h-5" />,
    trend: {
      rate: -9,
      label: "vs last week",
    },
  },
};

export const WithTrendNeutral: Story = {
  args: {
    title: "Active Owners",
    value: 15,
    trend: {
      rate: 0,
      label: "no change",
    },
  },
};
