import type { Meta, StoryObj } from "@storybook/react";
import { AppTooltip } from "./AppTooltip";
import { AppButton } from "../AppButton";
import { Info, Bell, Settings } from "lucide-react";

const meta: Meta<typeof AppTooltip> = {
  title: "UI/AppTooltip",
  component: AppTooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A minimal tooltip wrapper built for the BackTrack design system. " +
          "It works seamlessly with `AppButton` and other interactive elements.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppTooltip>;

/* ──────────────────────────────────────────────
   BASIC
────────────────────────────────────────────── */
export const Basic: Story = {
  render: () => (
    <AppTooltip content="This is a tooltip">
      <AppButton variant="secondary">Hover me</AppButton>
    </AppTooltip>
  ),
  name: "Basic",
};

/* ──────────────────────────────────────────────
   WITH ICON (Ghost button, visually balanced)
────────────────────────────────────────────── */
export const WithIcon: Story = {
  render: () => (
    <AppTooltip content="Notifications">
      <AppButton variant="ghost" size="sm" className="p-2">
        <Bell size={18} />
      </AppButton>
    </AppTooltip>
  ),
  name: "With Icon",
};

/* ──────────────────────────────────────────────
   PLACEMENTS (Top / Right / Bottom / Left)
────────────────────────────────────────────── */
export const Placements: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 justify-center items-center p-8">
      <AppTooltip content="Top (default)" placement="top">
        <AppButton size="sm" variant="secondary">
          <Info size={16} className="mr-1" /> Top
        </AppButton>
      </AppTooltip>

      <AppTooltip content="Right tooltip" placement="right">
        <AppButton size="sm" variant="secondary">
          <Settings size={16} className="mr-1" /> Right
        </AppButton>
      </AppTooltip>

      <AppTooltip content="Bottom tooltip" placement="bottom">
        <AppButton size="sm" variant="secondary">
          <Bell size={16} className="mr-1" /> Bottom
        </AppButton>
      </AppTooltip>

      <AppTooltip content="Left tooltip" placement="left">
        <AppButton size="sm" variant="secondary">
          <Info size={16} className="mr-1" /> Left
        </AppButton>
      </AppTooltip>
    </div>
  ),
  name: "Placements",
};
