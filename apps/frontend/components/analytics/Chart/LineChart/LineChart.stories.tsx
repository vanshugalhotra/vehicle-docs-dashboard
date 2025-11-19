import type { Meta, StoryObj } from '@storybook/react';
import { LineChart } from './LineChart';

const meta = {
  title: 'Charts/LineChart',
  component: LineChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof LineChart>;

const revenueData = [
  { month: 'Jan', revenue: 4000, profit: 2400 },
  { month: 'Feb', revenue: 3000, profit: 1398 },
  { month: 'Mar', revenue: 5000, profit: 2800 },
  { month: 'Apr', revenue: 2780, profit: 1908 },
  { month: 'May', revenue: 1890, profit: 1200 },
  { month: 'Jun', revenue: 2390, profit: 1500 },
];

const growthData = [
  { year: '2019', growth: 12 },
  { year: '2020', growth: 18 },
  { year: '2021', growth: 25 },
  { year: '2022', growth: 32 },
  { year: '2023', growth: 45 },
];

// 1. Basic Line Chart
export const Basic: Story = {
  args: {
    data: revenueData,
    xKey: 'month',
    yKey: 'revenue',
    width: 600,
    height: 400,
  },
};

// 2. With Title & Description
export const WithTitle: Story = {
  args: {
    data: revenueData,
    xKey: 'month',
    yKey: 'revenue',
    title: 'Monthly Revenue Trend',
    description: 'Revenue growth over the past 6 months',
    width: 600,
    height: 450,
  },
};

// 3. Custom Styled
export const CustomStyled: Story = {
  args: {
    data: revenueData,
    xKey: 'month',
    yKey: 'revenue',
    lineColor: '#10b981',
    gradient: false,
    width: 600,
    height: 400,
  },
};

// 4. Minimal Version
export const Minimal: Story = {
  args: {
    data: revenueData,
    xKey: 'month',
    yKey: 'revenue',
    grid: false,
    tooltip: false,
    gradient: false,
    animate: false,
    width: 600,
    height: 350,
  },
};

// 5. With Legend
export const WithLegend: Story = {
  args: {
    data: revenueData,
    xKey: 'month',
    yKey: 'revenue',
    legend: true,
    title: 'Revenue Overview',
    width: 600,
    height: 450,
  },
};

// 6. Growth Trend
export const GrowthTrend: Story = {
  args: {
    data: growthData,
    xKey: 'year',
    yKey: 'growth',
    title: 'Annual Growth Rate',
    description: 'Year-over-year growth percentage',
    lineColor: '#8b5cf6',
    width: 600,
    height: 400,
  },
};