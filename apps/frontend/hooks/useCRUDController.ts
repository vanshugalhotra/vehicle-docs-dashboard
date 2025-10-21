"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/fetchWithAuth";

export interface CRUDControllerConfig {
  baseUrl: string; // e.g. /api/vehicles
  queryKey: string; // e.g. "vehicles"
  defaultPageSize?: number;
  defaultFilters?: Record<string, unknown>;
}

export function useCRUDController<T extends { id?: string | number }>(
  config: CRUDControllerConfig
) {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState(config.defaultFilters ?? {});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.defaultPageSize ?? 10);
  const [sort, setSort] = useState<{ field?: string; order?: "asc" | "desc" }>(
    {}
  );

  // -------------------
  // FETCH LIST
  // -------------------
  const listQuery = useQuery({
    queryKey: [config.queryKey, filters, page, pageSize, sort],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        ...(sort.field ? { sort: `${sort.field}:${sort.order}` } : {}),
        ...Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v != null && v !== "")
        ),
      });

      const res = await fetchWithAuth(`${config.baseUrl}?${params.toString()}`);
      return res;
    },
  });

  // -------------------
  // CREATE
  // -------------------
  const createMutation = useMutation({
    mutationFn: async (data: T) =>
      fetchWithAuth(config.baseUrl, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [config.queryKey] }),
  });

  // -------------------
  // UPDATE
  // -------------------
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: Partial<T> }) =>
      fetchWithAuth(`${config.baseUrl}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [config.queryKey] }),
  });

  // -------------------
  // DELETE
  // -------------------
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) =>
      fetchWithAuth(`${config.baseUrl}/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [config.queryKey] }),
  });

  // -------------------
  // RETURN CONTROLLER
  // -------------------
  return {
    // Data
    data: (listQuery.data as { items: T[] })?.items ?? (listQuery.data as T[]) ?? [],
    total: (listQuery.data as { total: number })?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: listQuery.error as Error | null,

    // Pagination
    page,
    pageSize,
    setPage,
    setPageSize,

    // Filters & Sort
    filters,
    setFilters,
    sort,
    setSort,

    // CRUD Operations
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,

    // Utility
    refetch: listQuery.refetch,
  };
}
