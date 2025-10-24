"use client";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

export interface UseAsyncOptionsProps<T = unknown> {
  endpoint: string;
  search?: string;
  filterBy?: { key: string; value?: string };
  transform?: (data: T[]) => { label: string; value: string }[];
  enabled?: boolean;
  debounceMs?: number;
}

export function useAsyncOptions<T = unknown>({
  endpoint,
  search = "",
  filterBy,
  transform,
  enabled = true,
  debounceMs = 300,
}: UseAsyncOptionsProps<T>) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // --- debounce search ---
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), debounceMs);
    return () => clearTimeout(handler);
  }, [search, debounceMs]);

  // --- build query params ---
  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.append("search", debouncedSearch);
  if (filterBy?.key && filterBy?.value)
    queryParams.append(filterBy.key, filterBy.value);

  const queryKey = [endpoint, debouncedSearch, filterBy?.value];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<T[]> => {
      const url = queryParams.toString()
        ? `${endpoint}?${queryParams.toString()}`
        : endpoint;
      const res = await fetchWithAuth<T[]>(url);
      return res ?? [];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 min caching
  });

  // --- map to {label,value} format ---
  const options =
    data?.map((item) =>
      transform
        ? transform([item])[0]
        : { 
            label: (item as { name?: string; id: string }).name ?? "Unnamed", 
            value: (item as { id: string }).id 
          }
    ) ?? [];

  return { options, isLoading, isError, refetch };
}