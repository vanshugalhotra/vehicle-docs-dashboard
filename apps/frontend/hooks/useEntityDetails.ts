"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

export interface EntityDetailControllerConfig {
  queryKey: string;
  fetcher: (id: string) => string;
  id?: string;
  enabled?: boolean;
}

export function useEntityDetail<T>({
  queryKey,
  fetcher,
  id,
  enabled = true,
}: EntityDetailControllerConfig) {
  const query = useQuery({
    queryKey: [queryKey, id],
    enabled: enabled && !!id,
    queryFn: async () => {
      if (!id) throw new Error("Entity id is required");
      const url = fetcher(id);
      return fetchWithAuth(url);
    },
  });

  return {
    data: query.data as T | undefined,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
