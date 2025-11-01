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
          "Combined filter and sort bar with panel and compact modes.",
      },
    },
  },
  argTypes: {
    mode: {
      control: { type: "select" },
      options: ["panel", "compact"],
      description: "Layout mode - panel (card) or compact (inline)",
    },
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
    ui: { compact: true },
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
    ui: { compact: true },
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
  }
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
  args: {
    filtersConfig: mockFiltersConfig,
    sortOptions: mockSortOptions,
    autoApply: true,
    mode: "panel",
  },
  render: (args) => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {},
        sort: { field: "name", order: "asc" },
      });

      return (
        <div className="space-y-4">
          <FilterSortBar
            {...args}
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
};

export const CompactMode: Story = {
  args: {
    filtersConfig: mockFiltersConfig,
    sortOptions: mockSortOptions,
    autoApply: true,
    mode: "compact",
  },
  render: (args) => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {},
        sort: { field: "name", order: "asc" },
      });

      return (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-4">Inline Compact Mode</h3>
            <FilterSortBar
              {...args}
              initialState={state}
              onChange={setState}
            />
          </div>

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
        story: "Compact inline mode for toolbar integration.",
      },
    },
  },
};

export const PanelMode: Story = {
  args: {
    filtersConfig: mockFiltersConfig,
    sortOptions: mockSortOptions,
    autoApply: true,
    mode: "panel",
  },
  render: (args) => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {},
        sort: { field: "name", order: "asc" },
      });

      return (
        <div className="space-y-4">
          <FilterSortBar
            {...args}
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
        story: "Card panel mode with full filter display.",
      },
    },
  },
};

export const WithInitialState: Story = {
  args: {
    filtersConfig: mockFiltersConfig,
    sortOptions: mockSortOptions,
    mode: "panel",
  },
  render: (args) => {
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
            {...args}
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
  args: {
    filtersConfig: advancedFiltersConfig,
    sortOptions: mockSortOptions,
    mode: "panel",
  },
  render: (args) => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {},
        sort: { field: "name", order: "asc" },
      });

      return (
        <div className="space-y-4">
          <FilterSortBar
            {...args}
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
  args: {
    filtersConfig: mockFiltersConfig,
    sortOptions: mockSortOptions,
    mode: "panel",
    autoApply: false,
  },
  render: (args) => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {},
        sort: { field: "name", order: "asc" },
      });
      const [appliedState, setAppliedState] = useState<FilterSortState>(state);

      const handleChange = (newState: FilterSortState) => {
        setState(newState);
      };

      const handleApply = () => {
        setAppliedState(state);
      };

      return (
        <div className="space-y-4">
          <FilterSortBar
            {...args}
            initialState={state}
            onChange={handleChange}
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
  args: {
    filtersConfig: [],
    sortOptions: mockSortOptions,
    mode: "panel",
  },
  render: (args) => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {},
        sort: { field: "name", order: "asc" },
      });

      return (
        <div className="space-y-4">
          <FilterSortBar
            {...args}
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

export const ComplexFilters: Story = {
  args: {
    filtersConfig: advancedFiltersConfig,
    sortOptions: mockSortOptions,
    mode: "panel",
  },
  render: (args) => {
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
            {...args}
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
          "Shows complex filter combinations with range filters.",
      },
    },
  },
};

export const CompactWithLimitedFilters: Story = {
  args: {
    filtersConfig: mockFiltersConfig,
    sortOptions: mockSortOptions,
    mode: "compact",
  },
  render: (args) => {
    const Wrapper = () => {
      const [state, setState] = useState<FilterSortState>({
        filters: {
          search: "phone",
          category: "electronics",
        },
        sort: { field: "createdAt", order: "desc" },
      });

      return (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-white">
            <h3 className="font-semibold mb-4">Toolbar Integration</h3>
            <FilterSortBar
              {...args}
              initialState={state}
              onChange={setState}
            />
          </div>

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
        story: "Compact mode showing only marked compact filters (search and category).",
      },
    },
  },
};

export const ModeComparison: Story = {
  render: () => {
    const Wrapper = () => {
      const [panelState, setPanelState] = useState<FilterSortState>({
        filters: { category: "electronics" },
        sort: { field: "name", order: "asc" },
      });

      const [compactState, setCompactState] = useState<FilterSortState>({
        filters: { category: "electronics" },
        sort: { field: "name", order: "asc" },
      });

      return (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Panel Mode (Card Layout)</h3>
            <FilterSortBar
              filtersConfig={mockFiltersConfig}
              sortOptions={mockSortOptions}
              initialState={panelState}
              onChange={setPanelState}
              mode="panel"
            />
            <div className="mt-2 p-3 bg-blue-50 rounded">
              <pre className="text-xs">{JSON.stringify(panelState, null, 2)}</pre>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Compact Mode (Inline)</h3>
            <FilterSortBar
              filtersConfig={mockFiltersConfig}
              sortOptions={mockSortOptions}
              initialState={compactState}
              onChange={setCompactState}
              mode="compact"
            />
            <div className="mt-2 p-3 bg-green-50 rounded">
              <pre className="text-xs">{JSON.stringify(compactState, null, 2)}</pre>
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
        story: "Side-by-side comparison of panel vs compact modes.",
      },
    },
  },
};