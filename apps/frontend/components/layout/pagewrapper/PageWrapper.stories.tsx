import type { Meta, StoryObj } from "@storybook/react";
import { PageWrapper } from "./PageWrapper";
import { AppButton } from "@/components/ui/AppButton";

const meta: Meta<typeof PageWrapper> = {
  title: "Layout/PageWrapper",
  component: PageWrapper,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof PageWrapper>;

export const Basic: Story = {
  render: () => (
    <PageWrapper title="Vehicles">
      <p>Page content goes here...</p>
    </PageWrapper>
  ),
};

export const WithActions: Story = {
  render: () => (
    <PageWrapper
      title="Vehicles"
      actions={
        <>
          <AppButton variant="primary">Add Vehicle</AppButton>
          <AppButton variant="secondary">Export</AppButton>
        </>
      }
    >
      <p>Page content with actions...</p>
    </PageWrapper>
  ),
};
