"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
    refetch?: () => void;
  },
  debounceMs = 400,
  autoRefetch = true
): FilterSortState => {
  const [localFilters, setLocalFilters] = useState(controller.filters);
  const [localSort, setLocalSort] = useState(controller.sort);

  // Use refs for controller methods to avoid dependency loops
  const controllerRef = useRef(controller);
  useEffect(() => {
    controllerRef.current = controller;
  }, [controller]);

  // Sync external changes
  useEffect(() => {
    setLocalFilters(controller.filters);
  }, [controller.filters]);

  useEffect(() => {
    setLocalSort(controller.sort);
  }, [controller.sort]);

  // Debounced refetch with proper dependencies
  const debouncedRefetch = useCallback(
    () => debounce(() => controllerRef.current.refetch?.(), debounceMs),
    [debounceMs]
  );

  // Apply filters and optionally refetch
  const applyFilters = useCallback(
    (newFilters: FiltersObject) => {
      setLocalFilters(newFilters);
      controllerRef.current.setFilters(newFilters);
      if (autoRefetch) debouncedRefetch();
    },
    [autoRefetch, debouncedRefetch]
  );

  // Apply sorting
  const applySort = useCallback(
    (field: string, order: "asc" | "desc") => {
      const newSort = { field, order };
      setLocalSort(newSort);
      controllerRef.current.setSort(newSort);
      if (autoRefetch) debouncedRefetch();
    },
    [autoRefetch, debouncedRefetch]
  );

  // Reset helpers
  const resetFilters = useCallback(() => {
    setLocalFilters({});
    controllerRef.current.setFilters({});
    if (autoRefetch) debouncedRefetch();
  }, [autoRefetch, debouncedRefetch]);

  const resetSort = useCallback(() => {
    setLocalSort({});
    controllerRef.current.setSort({});
    if (autoRefetch) debouncedRefetch();
  }, [autoRefetch, debouncedRefetch]);

  return {
    filters: localFilters,
    sort: localSort,
    applyFilters,
    applySort,
    resetFilters,
    resetSort,
  };
};
