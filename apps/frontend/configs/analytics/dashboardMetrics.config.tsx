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
  variant?: "default" | "gradient" | "minimal";
}

export const dashboardMetricsConfig: DashboardMetricConfig[] = [
  {
    key: "totalVehicles",
    title: "Total Vehicles",
    icon: <Truck className="w-5 h-5 text-gray-700" />,
  },
  {
    key: "totalLinkages",
    title: "Total Linkages",
    icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
  },
  {
    key: "activeLinkages",
    title: "Active Linkages",
    icon: <Eye className="w-5 h-5 text-emerald-600" />,
  },
  {
    key: "expiringSoon",
    title: "Expiring Soon",
    icon: <Clock className="w-5 h-5 text-yellow-600" />,
  },
  {
    key: "expired",
    title: "Expired Linkages",
    icon: <FileWarning className="w-5 h-5 text-red-600" />,
  },
  {
    key: "unassignedVehicles",
    title: "Unassigned Vehicles",
    icon: <XCircle className="w-5 h-5 text-orange-600" />,
  },
  {
    key: "complianceRate",
    title: "Compliance Rate",
    icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    formatter: (v) => `${v}%`,
  },
];
