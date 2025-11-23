import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { apiRoutes } from "@/lib/apiRoutes";
import { statusToExpiryFilter } from "@/lib/utils/statusFilterCalculation";
import {
  OverviewStats,
  GroupedPoint,
  BucketPoint,
  VehicleDocumentItem,
  PaginatedResponse,
  VehicleDocumentStats,
  StatsParams,
  StatsEndpoint,
} from "@/lib/types/stats.types";

const endpointMap: Record<StatsEndpoint, string> = {
  overview: apiRoutes.stats.overview,
  "vehicles-grouped": apiRoutes.stats.vehiclesGrouped,
  "documents-expiry-distribution": apiRoutes.stats.documentsExpiryDistribution,
  "vehicle-document": apiRoutes.vehicle_documents.base,
};

export class StatsService {
  private buildUrl(endpoint: StatsEndpoint, params?: StatsParams): URL {
    const base = new URL(
      endpointMap[endpoint],
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost"
    );

    if (params) {
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
    }

    return base;
  }

  async fetchOverview(params?: StatsParams): Promise<OverviewStats> {
    const url = this.buildUrl("overview", params);
    const data = await fetchWithAuth(url.toString());
    return this.normalizeOverview(data as OverviewStats);
  }

  async fetchVehicleGroups(params?: StatsParams): Promise<GroupedPoint[]> {
    const url = this.buildUrl("vehicles-grouped", params);
    const data = await fetchWithAuth(url.toString());
    return this.normalizeGrouped(data as GroupedPoint[]);
  }

  async fetchExpiryDistribution(params?: StatsParams): Promise<BucketPoint[]> {
    const url = this.buildUrl("documents-expiry-distribution", params);
    const data = await fetchWithAuth(url.toString());
    return this.normalizeExpiryBuckets(data as BucketPoint[]);
  }

  async fetchVehicleDocuments(
    params?: StatsParams
  ): Promise<VehicleDocumentStats> {
    const expiryFilter = params?.status
      ? statusToExpiryFilter(params.status)
      : undefined;

    // Build URL for fetching all documents with filters
    const allBase = this.buildUrl("vehicle-document");
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
      (item: VehicleDocumentItem) => ({
        id: item.id,
        documentNo: item.documentNo,
        documentTypeName: item.documentTypeName,
        vehicleName: item.vehicleName,
        expiryDate: item.expiryDate,
        vehicleId: item.vehicleId,
      })
    );

    const totalDocuments = allResponse.total ?? 0;
    const vehicleIds = new Set(
      allResponse.items?.map((item: VehicleDocumentItem) => item.vehicleId) ??
        []
    );
    const totalVehicles = vehicleIds.size;

    // Return top N items for tab display
    const topItems = items.slice(0, params?.top ?? 3);

    return {
      items: topItems,
      totalDocuments,
      totalVehicles,
    };
  }

  // Normalizers
  private normalizeOverview(raw: OverviewStats): OverviewStats {
    return {
      ...raw,
      vehicleCreatedTrend: raw.vehicleCreatedTrend ?? [],
    };
  }

  private normalizeGrouped(raw: GroupedPoint[]): GroupedPoint[] {
    return (
      raw?.map((item) => ({
        label: item.label,
        count: item.count,
        id: item.id,
      })) ?? []
    );
  }

  private normalizeExpiryBuckets(raw: BucketPoint[]): BucketPoint[] {
    return raw ?? [];
  }
}

// Singleton instance
export const statsService = new StatsService();
