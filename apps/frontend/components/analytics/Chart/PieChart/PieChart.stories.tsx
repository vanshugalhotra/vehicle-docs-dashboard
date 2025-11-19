import type { Meta, StoryObj } from '@storybook/react';
import { PieChart } from './PieChart';

const meta = {
  title: 'Charts/PieChart',
  component: PieChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PieChart>;

export default meta;
type Story = StoryObj<typeof PieChart>;

const categoryData = [
  { category: 'Electronics', value: 35 },
  { category: 'Clothing', value: 25 },
  { category: 'Books', value: 20 },
  { category: 'Home', value: 15 },
  { category: 'Other', value: 5 },
];

const marketShareData = [
  { company: 'Apple', share: 40 },
  { company: 'Samsung', share: 25 },
  { company: 'Google', share: 15 },
  { company: 'Other', share: 20 },
];

const budgetData = [
  { department: 'Engineering', budget: 45 },
  { department: 'Marketing', budget: 25 },
  { department: 'Sales', budget: 20 },
  { department: 'HR', budget: 10 },
];

// 1. Basic Pie Chart
export const Basic: Story = {
  args: {
    data: categoryData,
    nameKey: 'category',
    valueKey: 'value',
    width: 500,
    height: 400,
  },
};

// 2. With Title & Description
export const WithTitle: Story = {
  args: {
    data: categoryData,
    nameKey: 'category',
    valueKey: 'value',
    title: 'Sales by Category',
    description: 'Distribution of sales across product categories',
    width: 500,
    height: 450,
  },
};

// 3. Market Share (Different Colors)
export const MarketShare: Story = {
  args: {
    data: marketShareData,
    nameKey: 'company',
    valueKey: 'share',
    title: 'Market Share',
    colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
    width: 500,
    height: 400,
  },
};

// 4. Solid Pie (No Donut)
export const SolidPie: Story = {
  args: {
    data: budgetData,
    nameKey: 'department',
    valueKey: 'budget',
    title: 'Budget Allocation',
    innerRadius: 0, // Solid pie
    gradient: false,
    width: 500,
    height: 400,
  },
};

// 5. Minimal Version
export const Minimal: Story = {
  args: {
    data: categoryData,
    nameKey: 'category',
    valueKey: 'value',
    tooltip: false,
    legend: false,
    animate: false,
    hoverEffect: false,
    width: 400,
    height: 350,
  },
};

// 6. Custom Donut Size
export const LargeDonut: Story = {
  args: {
    data: marketShareData,
    nameKey: 'company',
    valueKey: 'share',
    title: 'Market Distribution',
    innerRadius: 100, // Large donut hole
    width: 500,
    height: 400,
  },
};