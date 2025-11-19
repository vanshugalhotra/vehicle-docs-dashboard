import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsProps } from "./Tab";
import { useState } from "react";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof Tabs>;

const horizontalItems = [
  { key: "tab1", label: "Overview" },
  { key: "tab2", label: "Analytics" },
  { key: "tab3", label: "Settings" },
];

const verticalItems = [
  { key: "profile", label: "Profile" },
  { key: "security", label: "Security" },
  { key: "notifications", label: "Notifications" },
  { key: "billing", label: "Billing" },
];

// Interactive wrapper component with proper typing
const TabsWithState = (props: Omit<TabsProps, 'activeKey' | 'onChange'>) => {
  const [activeKey, setActiveKey] = useState<string | number>(props.items[0].key);
  return <Tabs {...props} activeKey={activeKey} onChange={setActiveKey} />;
};

// 1. Basic Horizontal Tabs
export const Basic: Story = {
  args: {
    items: horizontalItems,
  },
  render: (args) => <TabsWithState {...args} />,
};

// 2. Vertical Tabs
export const Vertical: Story = {
  args: {
    items: verticalItems,
    orientation: "vertical",
  },
  render: (args) => <TabsWithState {...args} />,
};

// 3. Underline Variant
export const Underline: Story = {
  args: {
    items: horizontalItems,
    variant: "underline",
  },
  render: (args) => <TabsWithState {...args} />,
};

// 4. Pills Variant
export const Pills: Story = {
  args: {
    items: horizontalItems,
    variant: "pills",
  },
  render: (args) => <TabsWithState {...args} />,
};

// 5. Enclosed Variant
export const Enclosed: Story = {
  args: {
    items: horizontalItems,
    variant: "enclosed",
  },
  render: (args) => <TabsWithState {...args} />,
};

// 6. Different Sizes
export const Sizes: Story = {
  args: {
    items: horizontalItems,
  },
  render: (args) => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-2">Small</h3>
        <TabsWithState {...args} size="sm" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Medium (Default)</h3>
        <TabsWithState {...args} size="md" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Large</h3>
        <TabsWithState {...args} size="lg" />
      </div>
    </div>
  ),
};

// 7. Full Width
export const FullWidth: Story = {
  args: {
    items: horizontalItems,
    fullWidth: true,
  },
  render: (args) => <TabsWithState {...args} />,
};

// 8. With Disabled Tabs
export const WithDisabled: Story = {
  args: {
    items: [
      { key: "tab1", label: "Overview" },
      { key: "tab2", label: "Analytics", disabled: true },
      { key: "tab3", label: "Settings" },
    ],
  },
  render: (args) => <TabsWithState {...args} />,
};

// 9. All Tabs Disabled
export const AllDisabled: Story = {
  args: {
    items: horizontalItems,
    disabled: true,
  },
  render: (args) => <TabsWithState {...args} />,
};

// 10. With Icons (Placeholder)
export const WithIcons: Story = {
  args: {
    items: [
      { key: "tab1", label: "Dashboard" },
      { key: "tab2", label: "Analytics" },
      { key: "tab3", label: "Settings" },
    ],
  },
  render: (args) => (
    <div className="text-center">
      <p className="text-sm text-gray-500 mb-4">
        Note: Add actual icon components to see icons in tabs
      </p>
      <TabsWithState {...args} />
    </div>
  ),
};

// 11. Many Tabs
export const ManyTabs: Story = {
  args: {
    items: [
      { key: "1", label: "First" },
      { key: "2", label: "Second" },
      { key: "3", label: "Third" },
      { key: "4", label: "Fourth" },
      { key: "5", label: "Fifth" },
    ],
  },
  render: (args) => <TabsWithState {...args} />,
};

// 12. Numeric Keys
export const NumericKeys: Story = {
  args: {
    items: [
      { key: 1, label: "Step 1" },
      { key: 2, label: "Step 2" },
      { key: 3, label: "Step 3" },
    ],
  },
  render: (args) => <TabsWithState {...args} />,
};