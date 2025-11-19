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
 * Expiring Documents Detailed Item
 * --------------------------------------------------*/

export interface ExpiringDocument {
  id: string;
  documentNo: string;
  documentTypeId: string;
  documentTypeName: string;
  startDate: string;
  expiryDate: string;
  daysRemaining: number;

  link?: string | null;
  notes?: string | null;

  createdAt?: string;
  updatedAt?: string;

  vehicle: {
    id: string;
    name: string;
    licensePlate: string | null;
    rcNumber?: string;
    chassisNumber?: string;
    engineNumber?: string;
    notes?: string | null;

    categoryId?: string;
    typeId?: string;
    ownerId?: string;
    driverId?: string;
    locationId?: string;

    createdAt?: string;
    updatedAt?: string;

    categoryName?: string;
    typeName?: string;
    ownerName?: string;
    driverName?: string;
    locationName?: string;
  };
}

/* ----------------------------------------------------
 * Paginated Response Wrapper
 * --------------------------------------------------*/

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}
