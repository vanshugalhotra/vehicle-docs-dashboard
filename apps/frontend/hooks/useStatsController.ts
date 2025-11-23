"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { apiRoutes } from "@/lib/apiRoutes";
import { statusToExpiryFilter } from "@/lib/utils/statusFilterCalculation";

import {
  OverviewStats,
  GroupedPoint,
  TrendPoint,
  BucketPoint,
  TrendApiItem,
  DocumentStatus,
  VehicleDocumentItem,
  PaginatedResponse,
  VehicleDocumentStats,
} from "@/lib/types/stats.types";

/* ---------------------------------------------
   Endpoints
----------------------------------------------*/
export type StatsEndpoint =
  | "overview"
  | "vehicles-grouped"
  | "vehicles-created-trend"
  | "documents-expiry-distribution"
  | "vehicle-document";

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

  status?: DocumentStatus;
  top?: number; // number of items to return for tab display
}

const endpointMap: Record<StatsEndpoint, string> = {
  overview: apiRoutes.stats.overview,
  "vehicles-grouped": apiRoutes.stats.vehiclesGrouped,
  "vehicles-created-trend": apiRoutes.stats.vehiclesCreatedTrend,
  "documents-expiry-distribution": apiRoutes.stats.documentsExpiryDistribution,
  "vehicle-document": apiRoutes.vehicle_documents.base,
};

/* ---------------------------------------------
   Normalizers
----------------------------------------------*/
function normalizeOverview(raw: OverviewStats): OverviewStats {
  return {
    ...raw,
    vehicleCreatedTrend: raw.vehicleCreatedTrend ?? [],
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

/* ---------------------------------------------
   Return types per endpoint
----------------------------------------------*/
type StatsResponseMap = {
  overview: OverviewStats;
  "vehicles-grouped": GroupedPoint[];
  "vehicles-created-trend": TrendPoint[];
  "documents-expiry-distribution": BucketPoint[];
  "vehicle-document": VehicleDocumentStats;
};

/* ---------------------------------------------
   Hook
----------------------------------------------*/
export function useStatsController<E extends StatsEndpoint>(
  endpoint: E,
  initialParams?: StatsParams
) {
  const [params, setParams] = useState<StatsParams>(initialParams || {});

  const queryKey = useMemo(
    () => ["stats", endpoint, params],
    [endpoint, params]
  );

  const queryFn = async (): Promise<unknown> => {
    // Vehicle document endpoint with status handling
    if (endpoint === "vehicle-document") {
      const expiryFilter = params.status
        ? statusToExpiryFilter(params.status)
        : undefined;

      // Fetch all to calculate totalVehicles and totalDocuments
      const allBase = new URL(
        endpointMap[endpoint],
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost"
      );
      if (expiryFilter) {
        allBase.searchParams.set(
          "filters",
          JSON.stringify({ expiryDate: expiryFilter })
        );
      }
      allBase.searchParams.set("sortBy", "expiryDate");
      allBase.searchParams.set("order", "asc");
      const allResponse = (await fetchWithAuth(
        allBase.toString()
      )) as PaginatedResponse<VehicleDocumentItem>;

      const items: VehicleDocumentItem[] = (allResponse.items ?? []).map(
        (i: VehicleDocumentItem) => ({
          id: i.id,
          documentNo: i.documentNo,
          documentTypeName: i.documentTypeName,
          vehicleName: i.vehicleName,
          expiryDate: i.expiryDate,
          vehicleId: i.vehicleId,
        })
      );

      const totalDocuments: number = allResponse.total ?? 0;
      const vehicleIds = new Set(
        allResponse.items?.map((i: VehicleDocumentItem) => i.vehicleId) ?? []
      );
      const totalVehicles = vehicleIds.size;

      // Only return top N items for tab display
      const topItems = items.slice(0, params.top ?? 3);

      const result: VehicleDocumentStats = {
        items: topItems,
        totalDocuments,
        totalVehicles,
      };

      return result;
    }

    // Standard endpoints
    const base = new URL(
      endpointMap[endpoint],
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost"
    );

    const qs = new URLSearchParams();
    
    if (endpoint === "documents-expiry-distribution") {
      if (params.bucketSize !== undefined) {
        qs.set("bucketSize", params.bucketSize.toString());
      }
      if (params.maxBucket !== undefined) {
        qs.set("maxBucket", params.maxBucket.toString());
      }
    } else {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          qs.set(key, String(value));
        }
      });
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

      case "vehicle-document":
        data = raw as VehicleDocumentStats as StatsResponseMap[E];
        break;
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
  };
}