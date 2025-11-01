"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/utils/fetchWithAuth";
import { serializeFilters } from "../lib/utils/filterSerializers";
import { FiltersObject } from "@/lib/types/filter.types";

export interface CRUDControllerConfigBase {
  baseUrl: string;
  fetchUrl: string;
  queryKey: string;
  defaultPageSize?: number;
  defaultFilters?: FiltersObject;
}

export function useCRUDController<
  T extends { id?: string | number },
  C extends CRUDControllerConfigBase = CRUDControllerConfigBase
>(config: C) {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<FiltersObject>(
    config.defaultFilters ?? {}
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.defaultPageSize ?? 5);
  const [sort, setSort] = useState<{ field?: string; order?: "asc" | "desc" }>(
    {}
  );

  // -------------------
  // FETCH LIST
  // -------------------
  const listQuery = useQuery({
    queryKey: [config.queryKey, filters, page, pageSize, sort],
    queryFn: async () => {
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      // build base url
      const base = new URL(
        config.fetchUrl,
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost"
      );

      const params = new URLSearchParams();

      params.set("skip", String(skip));
      params.set("take", String(take));

      if (sort.field) {
        params.set("sortBy", sort.field);
        params.set("order", sort.order ?? "desc");
      }

      // safely serialize filters to match backend expectations
      const serializedFilters = serializeFilters(filters);
      if (serializedFilters) {
        params.set("filters", serializedFilters);
      }

      // attach search string if provided through filters
      if (typeof filters.search === "string" && filters.search.trim() !== "") {
        params.set("search", filters.search.trim());
      }

      base.search = params.toString();

      const res = await fetchWithAuth(base.toString());
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
        method: "PATCH",
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
