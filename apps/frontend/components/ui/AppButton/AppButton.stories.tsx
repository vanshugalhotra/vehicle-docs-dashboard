import type { Meta, StoryObj } from "@storybook/react";
import { AppButton } from "./AppButton";
import { Bell } from "lucide-react";

const meta: Meta<typeof AppButton> = {
  title: "UI/AppButton",
  component: AppButton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "outline", "ghost", "danger", "link"],
    },
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    startIcon: { control: false },
    endIcon: { control: false },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof AppButton>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
  },
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <AppButton startIcon={<Bell size={16} />}>Start Icon</AppButton>
      <AppButton endIcon={<Bell size={16} />}>End Icon</AppButton>
      <AppButton startIcon={<Bell size={16} />} endIcon={<Bell size={16} />}>
        Both Icons
      </AppButton>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <AppButton loading>Loading</AppButton>
      <AppButton variant="secondary" loading>
        Loading
      </AppButton>
    </div>
  ),
};
