/**
 * ---------------------------------------------------------
 *  Analytics & Stats — Unified Type Definitions
 * ---------------------------------------------------------
 */

/* ----------------------------------------------------
 * Generic Visualization Types
 * --------------------------------------------------*/

export interface TrendPoint {
  label: string;
  value: number;
  date?: string;
}

export interface TrendApiItem {
  date: string;
  count: number;
}

export interface GroupedPoint {
  label: string;
  count: number;
  id?: string | number;
}

export interface BucketPoint {
  bucket: string;
  count: number;
}

/* ----------------------------------------------------
 * Overview Stats (Dashboard Home)
 * --------------------------------------------------*/

export interface OverviewStats {
  totalVehicles: number;
  totalLinkages: number;
  activeLinkages: number;
  expiringSoon: number;
  expired: number;
  unassignedVehicles: number;
  complianceRate: number;

  vehicleCreatedTrend: Array<{ date: string; count: number }>;
}

/* ----------------------------------------------------
 * Paginated Response Wrapper
 * --------------------------------------------------*/

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

/* ----------------------------------------------------
 * Vehicle Documents / Expiry Insights Types
 * --------------------------------------------------*/

export type DocumentStatus =
  | "expired"
  | "today"
  | "in_1_day"
  | "in_1_week"
  | "in_1_month"
  | "in_1_year";

export interface VehicleDocumentItem {
  id: string;
  documentNo: string;
  documentTypeName: string;
  vehicleName: string;
  expiryDate: string | Date;
  vehicleId: string;
}

export interface VehicleDocumentStats {
  items: VehicleDocumentItem[]; // top N items for the tab
  totalDocuments: number; // total documents matching filter
  totalVehicles: number; // unique vehicles matching filter     // % of fleet covered
}
export interface ExpiryInsights {
  status: DocumentStatus;
  data: VehicleDocumentStats;
}

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

export type StatsEndpoint =
  | "overview"
  | "vehicles-grouped"
  | "documents-expiry-distribution"
  | "vehicle-document";
