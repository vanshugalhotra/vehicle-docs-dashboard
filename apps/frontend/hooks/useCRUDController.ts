"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/utils/fetchWithAuth";
import { serializeFilters } from "@/lib/utils/filterUtils";
import { FiltersObject } from "@/lib/types/filter.types";

export interface CRUDControllerConfigBase {
  baseUrl: string;
  fetchUrl: string;
  queryKey: string;
  defaultPageSize?: number;
  defaultFilters?: FiltersObject;
  defaultBusinessFilters?: FiltersObject;
}

export function useCRUDController<
  T extends { id?: string | number },
  C extends CRUDControllerConfigBase = CRUDControllerConfigBase
>(config: C) {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<FiltersObject>(
    config.defaultFilters ?? {}
  );
  const [businessFilters, setBusinessFilters] = useState<FiltersObject>(
    config.defaultBusinessFilters ?? {}
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
    queryKey: [config.queryKey, filters, businessFilters, page, pageSize, sort],
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

      // -------------------
      // Serialize normal filters
      // -------------------
      const { search: searchTerm, ...otherFilters } = filters;
      const serializedFilters = serializeFilters(otherFilters);
      if (serializedFilters) {
        params.set("filters", serializedFilters);
      }

      // -------------------
      // Serialize business filters
      // -------------------
      if (businessFilters && Object.keys(businessFilters).length > 0) {
        const normalizedBusinessFilters = Object.fromEntries(
          Object.entries(businessFilters).map(([k, v]) => [
            k,
            v === "true" ? true : v === "false" ? false : v,
          ])
        );

        params.set(
          "businessFilters",
          JSON.stringify(normalizedBusinessFilters)
        );
      }

      // Add search separately
      if (
        searchTerm &&
        typeof searchTerm === "string" &&
        searchTerm.trim() !== ""
      ) {
        params.set("search", searchTerm.trim());
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
    businessFilters,
    setBusinessFilters,
    sort,
    setSort,

    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,

    refetch: listQuery.refetch,
  };
}
