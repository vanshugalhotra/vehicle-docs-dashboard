import type { Meta, StoryObj } from "@storybook/react";
import { Topbar } from "./Topbar";
import {
  Bell,
  Settings,
  User,
  Search,
  Plus,
  Filter,
  Download,
} from "lucide-react";
import { componentTokens } from "@/styles/design-system";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppText } from "@/components/ui/AppText";

const meta: Meta<typeof Topbar> = {
  title: "Layout/Topbar",
  component: Topbar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A global header bar for BackTrack. Displays page title and provides flexible slots for custom content. " +
          "Use `children` for center content and `rightActions` for right-aligned actions.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Topbar>;

// 🧱 Default example
export const Default: Story = {
  args: {
    title: "Dashboard",
  },
  name: "Default",
};

// 🎯 With right actions
export const WithRightActions: Story = {
  args: {
    title: "Vehicles",
    rightActions: (
      <>
        <AppButton size="sm" variant="outline" startIcon={<Filter size={16} />}>
          Filter
        </AppButton>
        <AppButton
          size="sm"
          variant="outline"
          startIcon={<Download size={16} />}
        >
          Export
        </AppButton>
        <AppButton size="sm" startIcon={<Plus size={16} />}>
          Add Vehicle
        </AppButton>
      </>
    ),
  },
  name: "With Right Actions",
};

// 🔍 With search and notifications
export const WithSearchAndNotifications: Story = {
  args: {
    title: "Inventory",
    rightActions: (
      <div className="flex items-center gap-2">
        <AppButton size="sm" variant="ghost" className="p-2">
          <Bell size={18} />
          <AppBadge
            variant="danger"
            size="sm"
            className="absolute -top-1 -right-1"
          >
            3
          </AppBadge>
        </AppButton>
        <AppButton size="sm" variant="ghost" className="p-2">
          <Settings size={18} />
        </AppButton>
        <AppButton size="sm" variant="ghost" className="p-2">
          <User size={18} />
        </AppButton>
      </div>
    ),
  },
  name: "With Search & Notifications",
};

// 🙋 With custom center content
export const WithCustomChildren: Story = {
  render: () => (
    <div className="bg-surface-subtle">
      <Topbar title="Profile">
        <div className="flex items-center gap-3">
          <AppBadge variant="success">Active</AppBadge>
          <AppText size="body" variant="secondary">
            Last login: 2 hours ago
          </AppText>
        </div>
      </Topbar>
    </div>
  ),
  name: "With Custom Children",
};

// 🎪 Both center content and right actions
export const WithBothChildrenAndRightActions: Story = {
  render: () => (
    <Topbar
      title="Orders"
      rightActions={
        <div className="flex items-center gap-2">
          <AppButton size="sm" variant="outline">
            Refresh
          </AppButton>
          <AppButton size="sm" startIcon={<Plus size={16} />}>
            New Order
          </AppButton>
        </div>
      }
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <AppBadge variant="info">Pending: 12</AppBadge>
          <AppBadge variant="success">Completed: 45</AppBadge>
          <AppBadge variant="warning">Overdue: 3</AppBadge>
        </div>
      </div>
    </Topbar>
  ),
  name: "With Both Children & Right Actions",
};

// 🪶 No shadow variant
export const NoShadow: Story = {
  args: {
    title: "Settings",
    showShadow: false,
    rightActions: (
      <AppButton size="sm" variant="outline" startIcon={<Settings size={16} />}>
        Preferences
      </AppButton>
    ),
  },
  name: "No Shadow",
};

// 🔹 Only title (minimal)
export const OnlyTitle: Story = {
  args: {
    title: "Minimal Header",
  },
  name: "Only Title",
};

// 🔹 Title with only right actions
export const TitleWithRightActionsOnly: Story = {
  args: {
    title: "Reports",
    rightActions: (
      <div className="flex items-center gap-2">
        <AppButton size="sm" variant="ghost">
          Share
        </AppButton>
        <AppButton size="sm" variant="ghost">
          Print
        </AppButton>
        <AppButton size="sm">Generate Report</AppButton>
      </div>
    ),
  },
  name: "Title with Right Actions Only",
};

// 🔹 Dense with icons only
export const DenseWithIcons: Story = {
  render: () => (
    <Topbar title="Compact Topbar" showShadow={true}>
      <div className="flex items-center gap-3">
        <Search size={18} className={componentTokens.text.secondary} />
        <Bell size={18} className={componentTokens.text.secondary} />
        <Settings size={18} className={componentTokens.text.secondary} />
      </div>
    </Topbar>
  ),
  name: "Dense with Icons",
};

// 📱 Complex real-world example
export const ComplexExample: Story = {
  render: () => (
    <Topbar
      title="Customer Management"
      showShadow={true}
      rightActions={
        <div className="flex items-center gap-2">
          <AppButton size="sm" variant="ghost" className="p-2">
            ?
          </AppButton>
          <AppButton
            size="sm"
            variant="outline"
            startIcon={<Download size={16} />}
          >
            Export All
          </AppButton>
          <AppButton size="sm" startIcon={<Plus size={16} />}>
            Add Customer
          </AppButton>
        </div>
      }
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <AppText size="body" variant="secondary">
            Total:
          </AppText>
          <AppBadge variant="neutral">248 customers</AppBadge>
        </div>
        <div className="w-px h-6 bg-border-subtle" />
        <div className="flex items-center gap-2">
          <AppText size="body" variant="success">
            Active:
          </AppText>
          <AppBadge variant="success">198</AppBadge>
        </div>
      </div>
    </Topbar>
  ),
  name: "Complex Example",
};
