import type { Meta, StoryObj } from "@storybook/react";
import { AppLayout } from "./AppLayout";
import { AppButton } from "@/components/ui/AppButton";
import { Bell, Settings, Download, Plus } from "lucide-react";

const meta: Meta<typeof AppLayout> = {
  title: "Layout/AppLayout",
  component: AppLayout,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof AppLayout>;

export const Default: Story = {
  render: () => (
    <AppLayout title="Dashboard">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome to BackTrack!</h2>
        <p>
          This is a mock page content inside <code>PageWrapper</code>.
        </p>

        <div className="mt-4">
          <AppButton variant="primary">Example Button</AppButton>
        </div>
      </div>
    </AppLayout>
  ),
};

export const WithCustomRightActions: Story = {
  render: () => (
    <AppLayout
      title="Reports"
      rightActions={
        <>
          <AppButton
            size="sm"
            variant="outline"
            startIcon={<Download size={16} />}
          >
            Export
          </AppButton>
          <AppButton size="sm" startIcon={<Plus size={16} />}>
            Generate
          </AppButton>
        </>
      }
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Reports Dashboard</h2>
        <p>This layout includes custom right actions alongside auth actions.</p>
      </div>
    </AppLayout>
  ),
};

export const WithNotificationAndSettings: Story = {
  render: () => (
    <AppLayout
      title="Settings"
      rightActions={
        <div className="flex items-center gap-2">
          <AppButton size="sm" variant="ghost" className="p-2">
            <Bell size={18} />
          </AppButton>
          <AppButton size="sm" variant="ghost" className="p-2">
            <Settings size={18} />
          </AppButton>
        </div>
      }
    >
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Settings Panel</h2>
        <p>This shows how to add icon-only buttons to the right actions.</p>
      </div>
    </AppLayout>
  ),
};

export const NoShadow: Story = {
  render: () => (
    <AppLayout title="Minimal View" showTopbarShadow={false}>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Topbar without shadow</h2>
        <p>The topbar in this example has no drop shadow.</p>
      </div>
    </AppLayout>
  ),
};
