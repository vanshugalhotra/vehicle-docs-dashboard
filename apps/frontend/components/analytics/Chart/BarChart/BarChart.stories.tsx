import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from './BarChart';

const meta = {
  title: 'Charts/BarChart',
  component: BarChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const salesData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 2780 },
  { month: 'May', revenue: 1890 },
  { month: 'Jun', revenue: 2390 },
];

// 1. Basic Chart
export const Basic: Story = {
  args: {
    data: salesData,
    xKey: 'month',
    yKey: 'revenue',
    width: 600,
    height: 400,
  },
};

// 2. With Title & Description
export const WithTitle: Story = {
  args: {
    data: salesData,
    xKey: 'month',
    yKey: 'revenue',
    title: 'Monthly Revenue',
    description: 'Revenue generated per month in USD',
    width: 600,
    height: 450,
  },
};

// 3. Custom Styling
export const CustomStyled: Story = {
  args: {
    data: salesData,
    xKey: 'month',
    yKey: 'revenue',
    barColor: '#10b981',
    gradient: false,
    rounded: false,
    width: 600,
    height: 400,
  },
};

// 4. Minimal Version
export const Minimal: Story = {
  args: {
    data: salesData,
    xKey: 'month',
    yKey: 'revenue',
    grid: false,
    tooltip: false,
    gradient: false,
    hoverEffect: false,
    showLabels: false,
    width: 600,
    height: 350,
  },
};

// 5. With Legend
export const WithLegend: Story = {
  args: {
    data: salesData,
    xKey: 'month',
    yKey: 'revenue',
    legend: true,
    title: 'Revenue Overview',
    width: 600,
    height: 450,
  },
};

// 6. No Animations
export const NoAnimations: Story = {
  args: {
    data: salesData,
    xKey: 'month',
    yKey: 'revenue',
    animate: false,
    hoverEffect: false,
    title: 'Static Chart',
    width: 600,
    height: 400,
  },
};