import type { Meta, StoryObj } from "@storybook/react";
import { ChartContainer } from "./ChartContainer";

const meta: Meta<typeof ChartContainer> = {
  title: "Dashboard/ChartContainer",
  component: ChartContainer,
};

export default meta;

type Story = StoryObj<typeof ChartContainer>;

export const Example: Story = {
  render: () => (
    <ChartContainer
      title="Vehicles Created Trend"
      description="Daily creation count over time"
    >
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        (Chart Placeholder)
      </div>
    </ChartContainer>
  ),
};
