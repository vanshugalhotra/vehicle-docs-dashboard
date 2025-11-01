"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { debounce } from "@/lib/utils/debounce";
import type { FiltersObject } from "@/lib/types/filter.types";

export interface FilterSortState {
  filters: FiltersObject;
  sort: { field?: string; order?: "asc" | "desc" };
  applyFilters: (newFilters: FiltersObject) => void;
  applySort: (field: string, order: "asc" | "desc") => void;
  resetFilters: () => void;
  resetSort: () => void;
}

export const useFilterSortState = (
  controller: {
    filters: FiltersObject;
    sort: { field?: string; order?: "asc" | "desc" };
    setFilters: (v: FiltersObject) => void;
    setSort: (v: { field?: string; order?: "asc" | "desc" }) => void;
  },
  debounceMs = 400
): FilterSortState => {
  const [localFilters, setLocalFilters] = useState(controller.filters);
  const [localSort, setLocalSort] = useState(controller.sort);

  // Create debounced function with useMemo to avoid recreation on every render
  const debouncedSetFilters = useMemo(
    () =>
      debounce((f: FiltersObject) => {
        controller.setFilters({ ...f });
      }, debounceMs),
    [controller, debounceMs] // Dependencies are now explicit
  );

  const applySort = useCallback(
    (field: string, order: "asc" | "desc") => {
      const newSort = { field, order };
      setLocalSort(newSort);
      controller.setSort({ ...newSort });
    },
    [controller]
  );

  const applyFilters = useCallback(
    (newFilters: FiltersObject) => {
      setLocalFilters(newFilters);
      debouncedSetFilters(newFilters);
    },
    [debouncedSetFilters] // Only depends on the debounced function
  );

  const resetFilters = useCallback(() => {
    setLocalFilters({});
    controller.setFilters({});
  }, [controller]);

  const resetSort = useCallback(() => {
    setLocalSort({});
    controller.setSort({});
  }, [controller]);

  // Sync external changes
  useEffect(() => {
    setLocalFilters(controller.filters);
  }, [controller.filters]);

  useEffect(() => {
    setLocalSort(controller.sort);
  }, [controller.sort]);

  return {
    filters: localFilters,
    sort: localSort,
    applyFilters,
    applySort,
    resetFilters,
    resetSort,
  };
};
