import type { Meta, StoryObj } from "@storybook/react";
import { SidebarProvider } from "@/lib/providers/SidebarProvider";
import { Sidebar } from "./Sidebar";
import { sidebarConfig } from "@/configs/sidebar.config";
import { Car, FileText } from "lucide-react";

const meta: Meta<typeof Sidebar> = {
  title: "Layout/Sidebar",
  component: Sidebar,
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", display: "flex" }}>
        <SidebarProvider>
          <Story />
        </SidebarProvider>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {};

export const Collapsed: Story = {
  render: () => (
    <SidebarProvider>
      {/* Force collapsed mode for visual check */}
      <div style={{ height: "100vh", display: "flex" }}>
        <div className="w-16">
          <Sidebar />
        </div>
      </div>
    </SidebarProvider>
  ),
};

export const CustomConfig: Story = {
  render: () => {
    const customConfig: typeof sidebarConfig = [
      {
        label: "Vehicles",
        icon: <Car size={18} />,
        path: "/vehicles",
      },
      {
        label: "Documents",
        icon: <FileText size={18} />,
        path: "/documents",
      },
    ];

    // Store original config
    const originalConfig = [...sidebarConfig];

    // Replace contents immutably
    sidebarConfig.splice(0, sidebarConfig.length, ...customConfig);

    const SidebarComponent = <Sidebar />;

    // Restore original config after rendering
    sidebarConfig.splice(0, sidebarConfig.length, ...originalConfig);

    return (
      <SidebarProvider>
        <div style={{ height: "100vh", display: "flex" }}>
          {SidebarComponent}
        </div>
      </SidebarProvider>
    );
  },
};
