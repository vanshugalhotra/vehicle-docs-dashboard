"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/utils/fetchWithAuth";

export interface CRUDControllerConfigBase {
  baseUrl: string;
  queryKey: string;
  defaultPageSize?: number;
  defaultFilters?: Record<string, unknown>;
}

export function useCRUDController<
  T extends { id?: string | number },
  C extends CRUDControllerConfigBase = CRUDControllerConfigBase
>(config: C) {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState(config.defaultFilters ?? {});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.defaultPageSize ?? 5);
  const [sort, setSort] = useState<{ field?: string; order?: "asc" | "desc" }>({});

  // -------------------
  // FETCH LIST
  // -------------------
  const listQuery = useQuery({
    queryKey: [config.queryKey, filters, page, pageSize, sort],
    queryFn: async () => {
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const params = new URLSearchParams({
        skip: String(skip),
        take: String(take),
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [config.queryKey] }),
  });

  // -------------------
  // UPDATE
  // -------------------
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<T>;
    }) =>
      fetchWithAuth(`${config.baseUrl}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [config.queryKey] }),
  });

  // -------------------
  // DELETE
  // -------------------
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) =>
      fetchWithAuth(`${config.baseUrl}/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [config.queryKey] }),
  });

  // -------------------
  // TOTAL & ITEMS
  // -------------------
  const items = Array.isArray(listQuery.data)
    ? listQuery.data
    : (listQuery.data as { items?: T[] })?.items ?? [];

  const total =
    (listQuery.data as { total?: number })?.total ??
    (Array.isArray(items) ? items.length : 0);

  // -------------------
  // RETURN CONTROLLER
  // -------------------
  return {
    data: items,
    total,
    isLoading: listQuery.isLoading,
    error: listQuery.error as Error | null,

    page,
    pageSize,
    setPage,
    setPageSize,

    filters,
    setFilters,
    sort,
    setSort,

    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,

    refetch: listQuery.refetch,
  };
}
