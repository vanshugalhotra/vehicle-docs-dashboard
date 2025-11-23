"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/lib/services/statsService";
import {
  StatsEndpoint,
  StatsParams,
  OverviewStats,
  GroupedPoint,
  BucketPoint,
  VehicleDocumentStats,
} from "@/lib/types/stats.types";

/* ---------------------------------------------
   Return types per endpoint
----------------------------------------------*/
type StatsResponseMap = {
  overview: OverviewStats;
  "vehicles-grouped": GroupedPoint[];
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

  const queryFn = useMemo(() => {
    const endpointFetchers = {
      overview: () => statsService.fetchOverview(params),
      "vehicles-grouped": () => statsService.fetchVehicleGroups(params),
      "documents-expiry-distribution": () => statsService.fetchExpiryDistribution(params),
      "vehicle-document": () => statsService.fetchVehicleDocuments(params),
    };

    return endpointFetchers[endpoint];
  }, [endpoint, params]);

  const query = useQuery({
    queryKey,
    queryFn: queryFn as () => Promise<StatsResponseMap[E]>,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    params,
    setParams,
    refetch: query.refetch,
  };
}