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

export interface DashboardMetricConfig<
  K extends keyof OverviewStats = keyof OverviewStats
> {
  key: K;
  title: string;
  icon: React.ReactNode;
  formatter?: (value: OverviewStats[K]) => string | number;
  variant?: "default" | "linear" | "minimal";
}

const iconSize = 22;
const variant = "linear";

export const dashboardMetricsConfig: DashboardMetricConfig[] = [
  {
    key: "totalVehicles",
    title: "Total Vehicles",
    icon: <Truck className="text-gray-700" size={iconSize} />,
    variant: variant,
  },
  {
    key: "totalLinkages",
    title: "Total Linkages",
    icon: <ShieldCheck className="text-blue-600" size={iconSize} />,
    variant: variant,
  },
  {
    key: "activeLinkages",
    title: "Active Linkages",
    icon: <Eye className="text-emerald-600" size={iconSize} />,
    variant: variant,
  },
  {
    key: "expiringSoon",
    title: "Expiring Soon",
    icon: <Clock className="text-yellow-600" size={iconSize} />,
    variant: variant,
  },
  {
    key: "expired",
    title: "Expired Linkages",
    icon: <FileWarning className="text-red-600" size={iconSize} />,
    variant: variant,
  },
  {
    key: "unassignedVehicles",
    title: "Unassigned Vehicles",
    icon: <XCircle className="text-orange-600" size={iconSize} />,
    variant: variant,
  },
  {
    key: "complianceRate",
    title: "Compliance Rate",
    icon: <CheckCircle className="text-emerald-600" size={iconSize} />,
    formatter: (v) => `${v}%`,
    variant: variant,
  },
];
