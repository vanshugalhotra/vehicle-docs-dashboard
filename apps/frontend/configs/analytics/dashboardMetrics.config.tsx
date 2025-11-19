import { Truck, CheckCircle, FileWarning, AlertTriangle } from "lucide-react";
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
    icon: <Truck className="w-5 h-5" />,
  },

  {
    key: "newVehicles",
    title: "New Vehicles",
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
  },

  {
    key: "totalDocuments",
    title: "Total Linkages",
    icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
  },

  {
    key: "documentsExpiringSoon",
    title: "Expiring Soon",
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
  },

  {
    key: "documentsExpired",
    title: "Expired Documents",
    icon: <FileWarning className="w-5 h-5 text-red-600" />,
  },

  {
    key: "complianceRate",
    title: "Compliance Rate",
    icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    formatter: (v) => `${v}%`,
  },
];
