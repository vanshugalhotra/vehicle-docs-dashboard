"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { apiRoutes } from "@/lib/apiRoutes";

import {
  OverviewStats,
  GroupedPoint,
  TrendPoint,
  BucketPoint,
  ExpiringDocument,
  PaginatedResponse,
  TrendApiItem,
} from "@/lib/types/stats.types";

/* ---------------------------------------------
   Endpoints
----------------------------------------------*/
export type StatsEndpoint =
  | "overview"
  | "vehicles-grouped"
  | "vehicles-created-trend"
  | "documents-expiry-distribution"
  | "documents-expiring-soon";

export interface StatsParams {
  startDate?: string;
  endDate?: string;

  categoryId?: string;
  typeId?: string;
  locationId?: string;
  ownerId?: string;

  search?: string;

  groupBy?: "category" | "location" | "owner" | "driver";
  bucketSize?: number;
  maxBucket?: number;
  withinDays?: number;

  vehicleId?: string;
  documentTypeId?: string;
}

const endpointMap: Record<StatsEndpoint, string> = {
  overview: apiRoutes.stats.overview,
  "vehicles-grouped": apiRoutes.stats.vehiclesGrouped,
  "vehicles-created-trend": apiRoutes.stats.vehiclesCreatedTrend,
  "documents-expiry-distribution": apiRoutes.stats.documentsExpiryDistribution,
  "documents-expiring-soon": apiRoutes.stats.documentsExpiringSoon,
};

/* ---------------------------------------------
   Normalizers
----------------------------------------------*/
function normalizeOverview(raw: OverviewStats): OverviewStats {
  return {
    ...raw,
    vehiclesByCategory: raw.vehiclesByCategory ?? [],
    vehiclesByLocation: raw.vehiclesByLocation ?? [],
    expiryDistribution: raw.expiryDistribution ?? [],
    documentsByType: raw.documentsByType ?? [],
    vehicleCreatedTrend: raw.vehicleCreatedTrend ?? [],
    documentExpiryTrend: raw.documentExpiryTrend ?? [],
  };
}

function normalizeGrouped(raw: GroupedPoint[]): GroupedPoint[] {
  return (
    raw?.map((r) => ({
      label: r.label,
      count: r.count,
      id: r.id,
    })) ?? []
  );
}

function normalizeTrend(raw: TrendApiItem[]): TrendPoint[] {
  return (
    raw?.map((r) => ({
      label: r.date ?? "",
      value: r.count ?? 0,
      date: r.date,
    })) ?? []
  );
}

const normalizeExpiryBuckets = (raw: BucketPoint[]): BucketPoint[] => raw ?? [];

const normalizeExpiringDocs = (raw: ExpiringDocument[]): ExpiringDocument[] =>
  raw ?? [];

/* ---------------------------------------------
   Return types per endpoint
----------------------------------------------*/
type StatsResponseMap = {
  overview: OverviewStats;
  "vehicles-grouped": GroupedPoint[];
  "vehicles-created-trend": TrendPoint[];
  "documents-expiry-distribution": BucketPoint[];
  "documents-expiring-soon": PaginatedResponse<ExpiringDocument>;
};

/* ---------------------------------------------
   Hook
----------------------------------------------*/
/* ---------------------------------------------
   Hook
----------------------------------------------*/
export function useStatsController<E extends StatsEndpoint>(
  endpoint: E,
  initialParams?: StatsParams // <-- new
) {
  const [params, setParams] = useState<StatsParams>(initialParams || {});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const url = endpointMap[endpoint];

  const queryKey = useMemo(
    () => ["stats", endpoint, params, page, pageSize],
    [endpoint, params, page, pageSize]
  );

  const queryFn = async (): Promise<unknown> => {
    const base = new URL(
      url,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost"
    );

    const qs = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        qs.set(key, String(value));
      }
    });

    if (endpoint === "documents-expiring-soon") {
      qs.set("skip", String((page - 1) * pageSize));
      qs.set("take", String(pageSize));
    }

    base.search = qs.toString();

    return fetchWithAuth(base.toString());
  };

  const query = useQuery({
    queryKey,
    queryFn,
  });

  const raw = query.data;

  let data: StatsResponseMap[E] | undefined = undefined;

  /* ---------------------------------------------
     Normalization Switch
  ----------------------------------------------*/
  if (raw) {
    switch (endpoint) {
      case "overview":
        data = normalizeOverview(raw as OverviewStats) as StatsResponseMap[E];
        break;

      case "vehicles-grouped":
        data = normalizeGrouped(raw as GroupedPoint[]) as StatsResponseMap[E];
        break;

      case "vehicles-created-trend":
        data = normalizeTrend(raw as TrendApiItem[]) as StatsResponseMap[E];
        break;

      case "documents-expiry-distribution":
        data = normalizeExpiryBuckets(
          raw as BucketPoint[]
        ) as StatsResponseMap[E];
        break;

      case "documents-expiring-soon": {
        const r = raw as
          | PaginatedResponse<ExpiringDocument>
          | ExpiringDocument[];

        if (Array.isArray(r)) {
          data = {
            items: normalizeExpiringDocs(r),
            total: r.length,
          } as StatsResponseMap[E];
        } else {
          data = {
            items: normalizeExpiringDocs(r.items),
            total: r.total,
          } as StatsResponseMap[E];
        }
        break;
      }
    }
  }

  /* ---------------------------------------------
     Return API
  ----------------------------------------------*/
  return {
    raw: raw as StatsResponseMap[E] | undefined,
    data,

    isLoading: query.isLoading,
    error: query.error as Error | null,

    params,
    setParams,

    refetch: query.refetch,

    page: endpoint === "documents-expiring-soon" ? page : undefined,
    setPage: endpoint === "documents-expiring-soon" ? setPage : undefined,

    pageSize: endpoint === "documents-expiring-soon" ? pageSize : undefined,
    setPageSize:
      endpoint === "documents-expiring-soon" ? setPageSize : undefined,
  };
}
