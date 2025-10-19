import type { Meta, StoryObj } from "@storybook/react";
import { Topbar } from "./Topbar";
import { Bell, Settings, User, Search } from "lucide-react";
import { theme } from "../../tokens/designTokens";

const meta: Meta<typeof Topbar> = {
  title: "Layout/Topbar",
  component: Topbar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A global header bar for BackTrack. Displays page title, optional action icons, and custom slots. " +
          "Uses `AppButton` and `AppTooltip` for consistent design language.",
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

// 🧭 With actions
export const WithActions: Story = {
  args: {
    title: "Vehicles",
    actions: [
      {
        icon: Search,
        tooltip: "Search",
        onClick: () => alert("Search clicked"),
      },
      {
        icon: Bell,
        tooltip: "Notifications",
        onClick: () => alert("Notifications clicked"),
      },
      {
        icon: Settings,
        tooltip: "Settings",
        onClick: () => alert("Settings clicked"),
      },
    ],
  },
  name: "With Actions",
};

// 🙋 With custom right-side content
export const WithCustomChildren: Story = {
  render: () => (
    <div className="bg-gray-50">
      <Topbar title="Profile">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${theme.light.colors.textSecondary}`}
          >
            Hello, Vanshu
          </span>
          <User size={18} className={theme.light.colors.textSecondary} />
        </div>
      </Topbar>
    </div>
  ),
  name: "With Custom Children",
};

// 🪶 No shadow variant
export const NoShadow: Story = {
  args: {
    title: "Settings",
    showShadow: false,
    actions: [
      {
        icon: Settings,
        tooltip: "Preferences",
        onClick: () => alert("Preferences clicked"),
      },
    ],
  },
  name: "No Shadow",
};

// 🔹 Only title (minimal)
export const OnlyTitle: Story = {
  args: {
    title: "Minimal Header",
    actions: [],
  },
  name: "Only Title",
};

// 🔹 Dense variant (smaller height)
export const Dense: Story = {
  render: () => (
    <Topbar title="Compact Topbar" showShadow={true}>
      <div className="flex items-center gap-2">
        <Bell size={18} className={theme.light.colors.textSecondary} />
        <Settings size={18} className={theme.light.colors.textSecondary} />
      </div>
    </Topbar>
  ),
  name: "Dense",
};
