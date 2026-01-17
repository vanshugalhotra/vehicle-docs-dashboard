"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { serializeFilters } from "@/lib/utils/filterUtils";
import type { FiltersObject } from "@/lib/types/filter.types";
import type { AuditLogResponseDto } from "@/lib/mappers/audit.mapper";
import { mapAuditLogDtoToUI } from "@/lib/mappers/audit.mapper";
import type { AuditLogUI, AuditEntity } from "@/lib/types/audit.types";
import { apiRoutes } from "@/lib/apiRoutes";

/* ======================================================
 * Types
 * ====================================================== */

export interface UseAuditLogsControllerConfig {
  mode: "global" | "entity";
  entityType?: AuditEntity;
  entityId?: string;

  defaultPageSize?: number;
  defaultFilters?: FiltersObject;
}

/* ======================================================
 * Hook
 * ====================================================== */

export function useAuditLogsController(config: UseAuditLogsControllerConfig) {
  const [filters, setFilters] = useState<FiltersObject>(
    config.defaultFilters ?? {}
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.defaultPageSize ?? 20);
  const [sort, setSort] = useState<{ field?: string; order?: "asc" | "desc" }>({
    field: "createdAt",
    order: "desc",
  });

  /* --------------------
   * Fetch URL resolver
   * -------------------- */
  const fetchUrl =
    config.mode === "entity"
      ? apiRoutes.audit.entity(
          String(config.entityType),
          String(config.entityId)
        )
      : apiRoutes.audit.base;

  /* --------------------
   * Query
   * -------------------- */
  const listQuery = useQuery({
    queryKey: [
      "audit-logs",
      config.mode,
      config.entityType,
      config.entityId,
      filters,
      page,
      pageSize,
      sort,
    ],
    queryFn: async () => {
      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const base = new URL(
        fetchUrl,
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

      const { search: searchTerm, ...otherFilters } = filters;

      const serializedFilters = serializeFilters(otherFilters);
      if (serializedFilters) {
        params.set("filters", serializedFilters);
      }

      if (searchTerm && typeof searchTerm === "string" && searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      base.search = params.toString();
      return fetchWithAuth(base.toString());
    },

    // ✅ v5 replacement for keepPreviousData
    placeholderData: (previousData) => previousData,
  });

  /* --------------------
   * Normalize response (same pattern as CRUD)
   * -------------------- */
  const rawItems =
    (listQuery.data as { items?: AuditLogResponseDto[] })?.items ?? [];

  const items: AuditLogUI[] = Array.isArray(rawItems)
    ? rawItems.map(mapAuditLogDtoToUI)
    : [];

  const total =
    (listQuery.data as { total?: number })?.total ??
    (Array.isArray(rawItems) ? rawItems.length : 0);

  /* --------------------
   * Return
   * -------------------- */
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

    refetch: listQuery.refetch,
  };
}
