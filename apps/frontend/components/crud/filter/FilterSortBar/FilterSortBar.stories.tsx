import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FilterSortBar } from "./FilterSortBar";
import { FilterConfig, FilterSortState } from "@/lib/types/filter.types";

const meta: Meta<typeof FilterSortBar> = {
  title: "Filters/FilterSortBar",
  component: FilterSortBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Combined filter and sort bar with expandable filter panel and sort controls.",
      },
    },
  },
  argTypes: {
    autoApply: {
      control: { type: "boolean" },
      description: "Whether to automatically apply filter changes",
    },
  },
};
export default meta;
type Story = StoryObj<typeof FilterSortBar>;

// Mock data
const mockSortOptions = [
  { field: "name", label: "Name", default: true },
  { field: "createdAt", label: "Date Created" },
  { field: "price", label: "Price" },
  { field: "status", label: "Status" },
];

const mockFiltersConfig: FilterConfig[] = [
  {
    key: "search",
    label: "Search",
    type: "text",
    placeholder: "Search items...",
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    placeholder: "Select category...",
    options: [
      { label: "Electronics", value: "electronics" },
      { label: "Clothing", value: "clothing" },
      { label: "Books", value: "books" },
      { label: "Home & Garden", value: "home" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status...",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Pending", value: "pending" },
    ],
  },
  {
    key: "priceRange",
    label: "Price Range",
    type: "numberRange",
    placeholder: "Enter price range...",
  },
];

const advancedFiltersConfig: FilterConfig[] = [
  ...mockFiltersConfig,
  {
    key: "dateRange",
    label: "Date Range",
    type: "dateRange",
  },
];

export const Default: Story = {
  render: () => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {},
        sort: { field: "name", order: "asc" },
      });

      return (
        <div className="space-y-4">
          <FilterSortBar
            filtersConfig={mockFiltersConfig}
            sortOptions={mockSortOptions}
            initialState={state}
            onChange={setState}
            autoApply={true}
          />

          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Current State:</h3>
            <pre className="text-sm">{JSON.stringify(state, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const WithInitialState: Story = {
  render: () => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {
          search: "laptop",
          category: "electronics",
        },
        sort: { field: "price", order: "desc" },
      });

      return (
        <div className="space-y-4">
          <FilterSortBar
            filtersConfig={mockFiltersConfig}
            sortOptions={mockSortOptions}
            initialState={state}
            onChange={setState}
          />

          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Current State:</h3>
            <pre className="text-sm">{JSON.stringify(state, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the component with pre-filled filters and sort state.",
      },
    },
  },
};

export const WithAdvancedFilters: Story = {
  render: () => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {},
        sort: { field: "name", order: "asc" },
      });

      return (
        <div className="space-y-4">
          <FilterSortBar
            filtersConfig={advancedFiltersConfig}
            sortOptions={mockSortOptions}
            initialState={state}
            onChange={setState}
          />

          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Current State:</h3>
            <pre className="text-sm">{JSON.stringify(state, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
  parameters: {
    docs: {
      description: {
        story: "Includes advanced filter types like date range.",
      },
    },
  },
};

export const ManualApplyMode: Story = {
  render: () => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {},
        sort: { field: "name", order: "asc" },
      });
      const [appliedState, setAppliedState] = useState<FilterSortState>(state);

      const handleChange = (newState: FilterSortState) => {
        setState(newState);
        // In manual mode, we don't apply immediately
      };

      const handleApply = () => {
        setAppliedState(state);
      };

      return (
        <div className="space-y-4">
          <FilterSortBar
            filtersConfig={mockFiltersConfig}
            sortOptions={mockSortOptions}
            initialState={state}
            onChange={handleChange}
            autoApply={false}
          />

          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply Filters
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Pending Changes:</h3>
              <pre className="text-sm">{JSON.stringify(state, null, 2)}</pre>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <h3 className="font-semibold mb-2">Applied State:</h3>
              <pre className="text-sm">
                {JSON.stringify(appliedState, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates manual apply mode where changes require explicit application.",
      },
    },
  },
};

export const NoFilters: Story = {
  render: () => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {},
        sort: { field: "name", order: "asc" },
      });

      return (
        <div className="space-y-4">
          <FilterSortBar
            filtersConfig={[]}
            sortOptions={mockSortOptions}
            initialState={state}
            onChange={setState}
          />

          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Current State:</h3>
            <pre className="text-sm">{JSON.stringify(state, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
  parameters: {
    docs: {
      description: {
        story: "Shows only sort controls when no filters are configured.",
      },
    },
  },
};

export const ComplexFiltersExpanded: Story = {
  render: () => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {
          category: "electronics",
          status: "active",
          priceRange: { gte: 100, lte: 500 },
        },
        sort: { field: "price", order: "asc" },
      });

      return (
        <div className="space-y-4">
          <FilterSortBar
            filtersConfig={advancedFiltersConfig}
            sortOptions={mockSortOptions}
            initialState={state}
            onChange={setState}
          />

          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Current State:</h3>
            <pre className="text-sm">{JSON.stringify(state, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the filter panel expanded by default with complex filter combinations.",
      },
    },
  },
};

export const WithDependentFilters: Story = {
  render: () => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {},
        sort: { field: "name", order: "asc" },
      });

      const dependentFiltersConfig: FilterConfig[] = [
        {
          key: "category",
          label: "Category",
          type: "select",
          placeholder: "Select category...",
          options: [
            { label: "Electronics", value: "electronics" },
            { label: "Clothing", value: "clothing" },
          ],
        },
      ];

      return (
        <div className="space-y-4">
          <FilterSortBar
            filtersConfig={dependentFiltersConfig}
            sortOptions={mockSortOptions}
            initialState={state}
            onChange={setState}
          />

          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Current State:</h3>
            <pre className="text-sm">{JSON.stringify(state, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates dependent filters where subcategory depends on category selection.",
      },
    },
  },
};

export const LoadingState: Story = {
  render: () => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {},
        sort: { field: "name", order: "asc" },
      });
      const [isLoading, setIsLoading] = useState(false);

      const handleChange = (newState: FilterSortState) => {
        setState(newState);
        // Simulate loading when filters change
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
      };

      return (
        <div className="space-y-4">
          <FilterSortBar
            filtersConfig={mockFiltersConfig}
            sortOptions={mockSortOptions}
            initialState={state}
            onChange={handleChange}
          />

          <div className="p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">Current State:</h3>
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              )}
            </div>
            <pre className="text-sm">{JSON.stringify(state, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
};
