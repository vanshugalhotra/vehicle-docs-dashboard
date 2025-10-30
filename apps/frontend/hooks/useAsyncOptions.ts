"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

export interface UseAsyncOptionsProps<T = unknown> {
  endpoint: string;
  search?: string;
  filterBy?: { key: string; value?: string };
  transform?: (data: T[]) => { label: string; value: string }[];
  enabled?: boolean;
  debounceMs?: number;
  extraParams?: Record<string, string | number | boolean>;
  selectedValue?: string;
}

/**
 * Async options hook for dropdowns with debounced search, optional relations,
 * and auto-include of currently selected value.
 */
export function useAsyncOptions<T = unknown>({
  endpoint,
  search = "",
  filterBy,
  transform,
  enabled = true,
  debounceMs = 300,
  extraParams,
  selectedValue,
}: UseAsyncOptionsProps<T>) {
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), debounceMs);
    return () => clearTimeout(handler);
  }, [search, debounceMs]);

  const queryParams = useMemo(() => {
    const qp = new URLSearchParams();
    if (debouncedSearch) qp.append("search", debouncedSearch);
    if (filterBy?.key && filterBy?.value)
      qp.append(filterBy.key, filterBy.value);
    if (extraParams) {
      Object.entries(extraParams).forEach(([key, val]) =>
        qp.append(key, String(val))
      );
    }
    return qp;
  }, [debouncedSearch, filterBy?.key, filterBy?.value, extraParams]);

  const queryKey = useMemo(
    () => [endpoint, debouncedSearch, filterBy?.value, extraParams],
    [endpoint, debouncedSearch, filterBy?.value, extraParams]
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<T[]> => {
      const url = queryParams.toString()
        ? `${endpoint}?${queryParams.toString()}`
        : endpoint;

      type PaginatedResponse = { items: T[]; total: number };
      type ArrayResponse = T[];

      const res = await fetchWithAuth<PaginatedResponse | ArrayResponse>(url);
      if (Array.isArray(res)) return res;
      if (res?.items && Array.isArray(res.items)) return res.items;
      return [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item) =>
      transform
        ? transform([item])[0]
        : {
            label: (item as { name?: string; id?: string }).name ?? "Unnamed",
            value: (item as { id?: string }).id ?? "",
          }
    );
  }, [data, transform]);

  useEffect(() => {
    if (!selectedValue || options.some((opt) => opt.value === selectedValue))
      return;

    (async () => {
      try {
        const res = await fetchWithAuth<T>(`${endpoint}/${selectedValue}`);
        if (!res) return;

        queryClient.setQueryData(queryKey, (old: unknown) => {
          if (Array.isArray(old)) return [...old, res];
          return [res];
        });
      } catch (err) {
        console.warn("[useAsyncOptions] Failed to fetch selected option:", err);
      }
    })();
  }, [selectedValue, options, endpoint, transform, queryKey, queryClient]);

  return { options, isLoading, isError, refetch };
}
