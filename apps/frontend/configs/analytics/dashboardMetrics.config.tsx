import {
  Truck,
  CheckCircle,
  FileWarning,
  Clock,
  Eye,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { OverviewStats } from "@/lib/types/stats.types";

// --------------------------------------------------
// Shared types
// --------------------------------------------------

export interface DashboardMetricConfig<
  K extends keyof OverviewStats = keyof OverviewStats
> {
  key: K;
  title: string;
  icon: React.ReactNode;
  formatter?: (value: OverviewStats[K]) => string | number;
  variant?: "default" | "linear" | "minimal";
  link?: string;
}

// --------------------------------------------------
// Constants
// --------------------------------------------------

const ICON_SIZE = 22;
const VARIANT: DashboardMetricConfig["variant"] = "linear";

// --------------------------------------------------
// Small helpers to remove all redundancy
// --------------------------------------------------

// Build a filter link
const buildFilterLink = (base: string, filter: object) =>
  `${base}?businessFilters=${encodeURIComponent(JSON.stringify(filter))}`;

// Build icons with color + shared size
const makeIcon = (Icon: React.ElementType, color: string) => (
  <Icon className={color} size={ICON_SIZE} />
);

// --------------------------------------------------
// Filters & links
// --------------------------------------------------

const links = {
  unassigned: buildFilterLink("/vehicles", { unassigned: true }),
  active: buildFilterLink("/linkages", { status: "active" }),
  expired: buildFilterLink("/linkages", { status: "expired" }),
  expiringSoon: buildFilterLink("/linkages", { status: "expiringSoon" }),
};

// --------------------------------------------------
// Final metrics config (super clean now)
// --------------------------------------------------

export const dashboardMetricsConfig: DashboardMetricConfig[] = [
  {
    key: "totalVehicles",
    title: "Total Vehicles",
    icon: makeIcon(Truck, "text-gray-700"),
    variant: VARIANT,
    link: "/vehicles",
  },
  {
    key: "totalLinkages",
    title: "Total Linkages",
    icon: makeIcon(ShieldCheck, "text-blue-600"),
    variant: VARIANT,
    link: "/linkages",
  },
  {
    key: "activeLinkages",
    title: "Active Linkages",
    icon: makeIcon(Eye, "text-emerald-600"),
    variant: VARIANT,
    link: links.active,
  },
  {
    key: "expiringSoon",
    title: "Expiring Soon",
    icon: makeIcon(Clock, "text-yellow-600"),
    variant: VARIANT,
    link: links.expiringSoon,
  },
  {
    key: "expired",
    title: "Expired Linkages",
    icon: makeIcon(FileWarning, "text-red-600"),
    variant: VARIANT,
    link: links.expired,
  },
  {
    key: "unassignedVehicles",
    title: "Unassigned Vehicles",
    icon: makeIcon(XCircle, "text-orange-600"),
    variant: VARIANT,
    link: links.unassigned,
  },
  {
    key: "complianceRate",
    title: "Compliance Rate",
    icon: makeIcon(CheckCircle, "text-emerald-600"),
    formatter: (v) => `${v}%`,
    variant: VARIANT,
  },
];
