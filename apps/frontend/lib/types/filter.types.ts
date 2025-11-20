import { Option } from "@/components/ui/AppSelect";

/* ---------- FILTERS ---------- */

export interface FilterOption {
  label: string;
  value: string | boolean;
}

export type FilterControlType = "text" | "select" | "async-select" | "dateRange";

export interface FilterConfig {
  key: string; // backend filter key
  label: string;
  type: FilterControlType;
  placeholder?: string;
  options?: FilterOption[];
  asyncSource?: string;
  transform?: (data: unknown[]) => Option[];
  allowMultiple?: boolean;
  dependsOn?: {
    key: string;
    transform?: (parentValue: unknown) => unknown;
  };
  ui?: {
    compact?: boolean;
    width?: string | number;
    columnSpan?: number;
  };
}

/** Canonical filters object used in state & serialization */
export type FilterValue =
  | string
  | number
  | boolean
  | (string | number | boolean)[]
  | { gte?: string | number; lte?: string | number }
  | null
  | undefined;

export type FiltersObject = Record<string, FilterValue>;

/* ---------- SORT ---------- */

export interface SortOption {
  field: string;
  label: string;
  default?: boolean;
}

export interface SortState {
  field?: string;
  order?: "asc" | "desc";
}

/* ---------- COMBINED STATE ---------- */

export interface FilterSortState {
  filters: FiltersObject;
  sort: SortState;
}
