// lib/types/filter.ts

/** Basic type for option-based filters (static or async) */
export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

/** Supported filter control types */
export type FilterControlType =
  | "text"
  | "select"
  | "async-select"
  | "multi-select"
  | "boolean"
  | "dateRange"
  | "numberRange";

/** FilterConfig defines how each filter behaves and renders */
export interface FilterConfig {
  /** The backend filter key (maps to filters JSON key) */
  key: string;
  /** Display label */
  label: string;
  /** UI control type */
  type: FilterControlType;
  /** Optional placeholder text */
  placeholder?: string;
  /** Static options for select / multi-select */
  options?: FilterOption[];
  /** API endpoint for async selects */
  asyncSource?: string;
  /** Dependency config (for dependent selects) */
  dependsOn?: {
    key: string;
    transform?: (parentValue: string | number | boolean | (string | number | boolean)[] | null | undefined) => string | number | boolean | (string | number | boolean)[] | null | undefined;
  };
  /** Allow multiple selection (only relevant for select/multi-select) */
  allowMultiple?: boolean;
  /** Layout hints for responsive filter bar */
  ui?: {
    compact?: boolean;
    width?: string | number;
    columnSpan?: number;
  };
}

/** Sorting options for a CRUD entity */
export interface SortOption {
  field: string;
  label: string;
  default?: boolean;
}

/** Sort state used internally */
export interface SortState {
  field: string;
  order: "asc" | "desc";
}

/** Filter value representations for each control type */
export type FilterValue =
  | string
  | number
  | boolean
  | (string | number | boolean)[]
  | { gte?: string | number; lte?: string | number } // for range types
  | null
  | undefined;

/** Canonical filters object used in state & serialization */
export type FiltersObject = Record<string, FilterValue>;

/** Hook state shape for filter + sort */
export interface FilterSortState {
  filters: FiltersObject;
  sort: SortState;
}

/** Props for main FilterSortBar */
export interface FilterSortBarProps {
  filtersConfig: FilterConfig[];
  sortOptions: SortOption[];
  initialState?: FilterSortState;
  autoApply?: boolean;
  onChange?: (state: FilterSortState) => void;
}