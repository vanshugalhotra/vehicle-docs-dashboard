import { useStatsController } from "./useStatsController";
import { GroupedPoint } from "@/lib/types/stats.types";
import { VehiclesGroupBy } from "@/configs/analytics/vehiclesByGroup.config";

export const useVehicleGroups = () => {
  const categoryStats = useStatsController("vehicles-grouped", { groupBy: "category" });
  const locationStats = useStatsController("vehicles-grouped", { groupBy: "location" });
  const ownerStats = useStatsController("vehicles-grouped", { groupBy: "owner" });
  const driverStats = useStatsController("vehicles-grouped", { groupBy: "driver" });

  const data: Record<VehiclesGroupBy, GroupedPoint[]> = {
    category: categoryStats.data || [],
    location: locationStats.data || [],
    owner: ownerStats.data || [],
    driver: driverStats.data || [],
  };

  const isLoading = categoryStats.isLoading || locationStats.isLoading || ownerStats.isLoading || driverStats.isLoading;
  const error = categoryStats.error || locationStats.error || ownerStats.error || driverStats.error;

  return { data, isLoading, error };
};