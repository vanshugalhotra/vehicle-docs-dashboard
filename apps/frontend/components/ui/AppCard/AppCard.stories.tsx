import type { Meta, StoryObj } from "@storybook/react";
import { AppCard } from "./AppCard";
import { AppButton } from "../AppButton"; // optional for actions in story

const meta: Meta<typeof AppCard> = {
  title: "UI/AppCard",
  component: AppCard,
};
export default meta;
type Story = StoryObj<typeof AppCard>;

export const Default: Story = {
  args: {
    title: "Card Title",
    children: <p>This is the content of the card.</p>,
  },
};

export const WithActions: Story = {
  args: {
    title: "Card With Actions",
    children: <p>Content with a button in the header.</p>,
    actions: (
      <AppButton variant="primary" size="sm">
        Action
      </AppButton>
    ),
  },
};

export const NoHeader: Story = {
  args: {
    children: <p>This card has no title or actions.</p>,
  },
};
