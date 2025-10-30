import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { PaginationBar } from "./PaginationBar";
import type { PaginationBarProps } from "./PaginationBar";

const meta: Meta<typeof PaginationBar> = {
  title: "Components/PaginationBar",
  component: PaginationBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PaginationBar>;

// Interactive wrapper component
const PaginationBarWithState: React.FC<Omit<PaginationBarProps, 'page' | 'pageSize' | 'onPageChange' | 'onPageSizeChange'> & {
  initialPage?: number;
  initialPageSize?: number;
}> = ({
  initialPage = 1,
  initialPageSize = 10,
  ...props
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(initialPageSize);

  return (
    <div className="w-full max-w-4xl">
      <PaginationBar
        {...props}
        page={currentPage}
        pageSize={currentPageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setCurrentPageSize}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <PaginationBarWithState {...args} />,
  args: {
    totalCount: 150,
    pageSizeOptions: [10, 20, 50, 100],
  },
};

export const FirstPage: Story = {
  render: (args) => <PaginationBarWithState {...args} initialPage={1} />,
  args: {
    totalCount: 150,
  },
};

export const MiddlePage: Story = {
  render: (args) => <PaginationBarWithState {...args} initialPage={5} />,
  args: {
    totalCount: 150,
  },
};

export const LastPage: Story = {
  render: (args) => <PaginationBarWithState {...args} initialPage={15} />,
  args: {
    totalCount: 150,
  },
};

export const LargeDataset: Story = {
  render: (args) => <PaginationBarWithState {...args} initialPage={42} initialPageSize={30} />,
  args: {
    totalCount: 1247,
    pageSizeOptions: [10, 30, 50, 100],
  },
};

export const SmallDataset: Story = {
  render: (args) => <PaginationBarWithState {...args} />,
  args: {
    totalCount: 8,
  },
};

export const SinglePage: Story = {
  render: (args) => <PaginationBarWithState {...args} />,
  args: {
    totalCount: 5,
  },
};

export const NoData: Story = {
  render: (args) => <PaginationBarWithState {...args} />,
  args: {
    totalCount: 0,
  },
};

export const CustomPageSizes: Story = {
  render: (args) => <PaginationBarWithState {...args} initialPage={3} initialPageSize={25} />,
  args: {
    totalCount: 500,
    pageSizeOptions: [5, 25, 75, 150],
  },
};

export const LoadingState: Story = {
  render: (args) => <PaginationBarWithState {...args} initialPage={5} />,
  args: {
    totalCount: 150,
    isLoading: true,
  },
};

export const DisabledButtons: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-4xl">
      <div>
        <h3 className="text-sm font-medium mb-2">First Page (Previous disabled)</h3>
        <PaginationBar
          totalCount={150}
          page={1}
          pageSize={10}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Last Page (Next disabled)</h3>
        <PaginationBar
          totalCount={150}
          page={15}
          pageSize={10}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
        />
      </div>
    </div>
  ),
};

export const VeryLargeNumbers: Story = {
  render: (args) => <PaginationBarWithState {...args} initialPage={50000} initialPageSize={20} />,
  args: {
    totalCount: 1000000,
  },
};