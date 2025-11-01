import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FilterNumberRange } from "./FilterNumberRange";

const meta: Meta<typeof FilterNumberRange> = {
  title: "Filters/FilterNumberRange",
  component: FilterNumberRange,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A number range filter component with min and max inputs for filtering numeric values within a range.",
      },
    },
  },
  argTypes: {
    value: {
      control: { type: "object" },
      description: "Current range value with min and max properties",
    },
    onChange: {
      action: "changed",
      description: "Callback fired when the range values change",
    },
    placeholderMin: {
      control: { type: "text" },
      description: "Placeholder for the minimum input field",
    },
    placeholderMax: {
      control: { type: "text" },
      description: "Placeholder for the maximum input field",
    },
    className: {
      control: { type: "text" },
      description: "Additional CSS class names",
    },
  },
};
export default meta;
type Story = StoryObj<typeof FilterNumberRange>;

export const Default: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<{ min?: number; max?: number }>({});

      return (
        <div className="max-w-md">
          <FilterNumberRange
            label="Price Range"
            value={value}
            onChange={setValue}
            placeholderMin="Min price"
            placeholderMax="Max price"
          />
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <pre>Current value: {JSON.stringify(value, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const WithInitialValues: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<{ min?: number; max?: number }>({
        min: 10,
        max: 1000,
      });

      return (
        <div className="max-w-md">
          <FilterNumberRange
            label="Price Range"
            value={value}
            onChange={setValue}
            placeholderMin="Min price"
            placeholderMax="Max price"
          />
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <pre>Current value: {JSON.stringify(value, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const CustomPlaceholders: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<{ min?: number; max?: number }>({});

      return (
        <div className="max-w-md">
          <FilterNumberRange
            label="Age Range"
            value={value}
            onChange={setValue}
            placeholderMin="From age"
            placeholderMax="To age"
          />
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <pre>Current value: {JSON.stringify(value, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const WithoutLabel: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<{ min?: number; max?: number }>({});

      return (
        <div className="max-w-md">
          <FilterNumberRange
            value={value}
            onChange={setValue}
            placeholderMin="Minimum"
            placeholderMax="Maximum"
          />
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <pre>Current value: {JSON.stringify(value, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const WithCustomWidth: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<{ min?: number; max?: number }>({});

      return (
        <div className="max-w-lg">
          <FilterNumberRange
            label="Custom Width Range"
            value={value}
            onChange={setValue}
            placeholderMin="Start value"
            placeholderMax="End value"
            className="w-full"
          />
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <pre>Current value: {JSON.stringify(value, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const EmptyState: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<{ min?: number; max?: number }>({});

      return (
        <div className="max-w-md">
          <FilterNumberRange
            label="Empty Range Filter"
            value={value}
            onChange={setValue}
          />
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <pre>Current value: {JSON.stringify(value, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const OnlyMinValue: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<{ min?: number; max?: number }>({
        min: 50,
      });

      return (
        <div className="max-w-md">
          <FilterNumberRange
            label="Minimum Only"
            value={value}
            onChange={setValue}
            placeholderMin="At least"
            placeholderMax="Up to"
          />
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <pre>Current value: {JSON.stringify(value, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const OnlyMaxValue: Story = {
  render: () => {
    const Wrapper = () => {
      const [value, setValue] = useState<{ min?: number; max?: number }>({
        max: 100,
      });

      return (
        <div className="max-w-md">
          <FilterNumberRange
            label="Maximum Only"
            value={value}
            onChange={setValue}
            placeholderMin="From"
            placeholderMax="No more than"
          />
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <pre>Current value: {JSON.stringify(value, null, 2)}</pre>
          </div>
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const InFormContext: Story = {
  render: () => {
    const Wrapper = () => {
      const [filters, setFilters] = useState({
        priceRange: {},
        quantityRange: { min: 1 },
        weightRange: { max: 5000 },
      });

      const updateFilter = (
        key: string,
        value: { min?: number; max?: number }
      ) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
      };

      return (
        <div className="max-w-md space-y-6 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">Product Filters</h3>

          <FilterNumberRange
            label="Price Range ($)"
            value={filters.priceRange}
            onChange={(value) => updateFilter("priceRange", value)}
            placeholderMin="Min price"
            placeholderMax="Max price"
          />

          <FilterNumberRange
            label="Quantity Range"
            value={filters.quantityRange}
            onChange={(value) => updateFilter("quantityRange", value)}
            placeholderMin="Min quantity"
            placeholderMax="Max quantity"
          />

          <FilterNumberRange
            label="Weight Range (g)"
            value={filters.weightRange}
            onChange={(value) => updateFilter("weightRange", value)}
            placeholderMin="Min weight"
            placeholderMax="Max weight"
          />

          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <pre>All filters: {JSON.stringify(filters, null, 2)}</pre>
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
          "Demonstrates multiple FilterNumberRange components working together in a form context.",
      },
    },
  },
};
