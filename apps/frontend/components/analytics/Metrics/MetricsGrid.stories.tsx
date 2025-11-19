import type { Meta, StoryObj } from "@storybook/react";
import { MetricsGrid } from "./MetricsGrid";
import { MetricCard } from "./MetricCard";
import { Truck } from "lucide-react";

const meta: Meta<typeof MetricsGrid> = {
  title: "Dashboard/MetricsGrid",
  component: MetricsGrid,
};

export default meta;

type Story = StoryObj<typeof MetricsGrid>;

export const Example: Story = {
  render: () => (
    <MetricsGrid>
      <MetricCard title="Vehicles" value={128} icon={<Truck />} />
      <MetricCard title="Expiring Soon" value={14} />
      <MetricCard title="Expired" value={5} />
      <MetricCard title="Active Drivers" value={22} />
    </MetricsGrid>
  ),
};
