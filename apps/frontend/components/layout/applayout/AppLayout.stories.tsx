import type { Meta, StoryObj } from "@storybook/react";
import { AppLayout } from "./AppLayout";
import { AppButton } from "@/components/ui/AppButton";
import { Car, Bell, Settings } from "lucide-react";

const meta: Meta<typeof AppLayout> = {
  title: "Layout/AppLayout",
  component: AppLayout,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof AppLayout>;

export const Default: Story = {
  render: () => (
    <AppLayout
      title="Dashboard"
      topbarActions={[
        {
          icon: Bell,
          tooltip: "Notifications",
          onClick: () => alert("Bell clicked"),
        },
        { icon: Car, tooltip: "Vehicles", onClick: () => alert("Car clicked") },
        {
          icon: Settings,
          tooltip: "Settings",
          onClick: () => alert("Settings clicked"),
        },
      ]}
    >
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
