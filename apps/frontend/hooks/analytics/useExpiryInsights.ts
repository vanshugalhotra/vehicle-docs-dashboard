import { useStatsController } from "./useStatsController";
import { ExpiryInsights } from "@/lib/types/stats.types";

export const useExpiryInsights = () => {
  // Call hooks at the top level
  const expiredStats = useStatsController("vehicle-document", {
    status: "expired",
  });
  const todayStats = useStatsController("vehicle-document", {
    status: "today",
  });
  const in1DayStats = useStatsController("vehicle-document", {
    status: "in_1_day",
  });
  const in1WeekStats = useStatsController("vehicle-document", {
    status: "in_1_week",
  });
  const in1MonthStats = useStatsController("vehicle-document", {
    status: "in_1_month",
  });
  const in1YearStats = useStatsController("vehicle-document", {
    status: "in_1_year",
  });

  const data: ExpiryInsights[] = [
    {
      status: "expired",
      data: expiredStats.data || {
        items: [],
        totalDocuments: 0,
        totalVehicles: 0,
      },
    },
    {
      status: "today",
      data: todayStats.data || {
        items: [],
        totalDocuments: 0,
        totalVehicles: 0,
      },
    },
    {
      status: "in_1_day",
      data: in1DayStats.data || {
        items: [],
        totalDocuments: 0,
        totalVehicles: 0,
      },
    },
    {
      status: "in_1_week",
      data: in1WeekStats.data || {
        items: [],
        totalDocuments: 0,
        totalVehicles: 0,
      },
    },
    {
      status: "in_1_month",
      data: in1MonthStats.data || {
        items: [],
        totalDocuments: 0,
        totalVehicles: 0,
      },
    },
    {
      status: "in_1_year",
      data: in1YearStats.data || {
        items: [],
        totalDocuments: 0,
        totalVehicles: 0,
      },
    },
  ];

  const isLoading =
    expiredStats.isLoading ||
    todayStats.isLoading ||
    in1DayStats.isLoading ||
    in1WeekStats.isLoading ||
    in1MonthStats.isLoading ||
    in1YearStats.isLoading;
  const error =
    expiredStats.error ||
    todayStats.error ||
    in1DayStats.error ||
    in1WeekStats.error ||
    in1MonthStats.error ||
    in1YearStats.error;

  return { data, isLoading, error };
};
