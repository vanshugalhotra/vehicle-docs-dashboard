import type { Meta, StoryObj } from "@storybook/react";
import { LineChart } from "./LineChart";

type RevenueData = {
  month: string;
  revenue: number;
  profit: number;
};

const meta = {
  title: "Charts/LineChart",
  component: LineChart as typeof LineChart<RevenueData>,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LineChart<RevenueData>>;

export default meta;
type Story = StoryObj<typeof meta>;

const revenueData: RevenueData[] = [
  { month: "Jan", revenue: 4000, profit: 2400 },
  { month: "Feb", revenue: 3000, profit: 1398 },
  { month: "Mar", revenue: 5000, profit: 2800 },
  { month: "Apr", revenue: 2780, profit: 1908 },
  { month: "May", revenue: 1890, profit: 1200 },
  { month: "Jun", revenue: 2390, profit: 1500 },
];

// 1. Basic Line Chart
export const Basic: Story = {
  args: {
    data: revenueData,
    xKey: "month",
    yKey: "revenue",
    width: 600,
    height: 400,
  },
};

// 2. With Title & Description
export const WithTitle: Story = {
  args: {
    data: revenueData,
    xKey: "month",
    yKey: "revenue",
    title: "Monthly Revenue Trend",
    description: "Revenue growth over the past 6 months",
    width: 600,
    height: 450,
  },
};

// 3. Custom Styled
export const CustomStyled: Story = {
  args: {
    data: revenueData,
    xKey: "month",
    yKey: "revenue",
    lineColor: "#10b981",
    gradient: false,
    width: 600,
    height: 400,
  },
};
