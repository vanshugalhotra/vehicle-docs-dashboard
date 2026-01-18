"use client";

import React, { useMemo } from "react";
import { StatsSection } from "@/components/analytics/layout/StatsSection";
import {
  TabbedSection,
  TabConfig,
} from "@/components/analytics/layout/SectionWithTabs";
import { ImpactSummaryCard } from "@/components/analytics/Cards/ImpactSummaryCard";
import { LinkageCard } from "@/components/analytics/Cards/LinkageCard";
import { AlertTriangle } from "lucide-react";
import {
  ExpiryInsights,
  VehicleDocumentItem,
  BucketPoint,
} from "@/lib/types/stats.types";
import { getExpireStatus } from "@/lib/utils/dateUtils";
import { useRouter } from "next/navigation";
import { AppText } from "@/components/ui/AppText";
import { ExpiryInsightsCharts } from "../Chart/Sections/ExpiryInsightsCharts";

interface ExpiryInsightsSectionProps {
  data?: ExpiryInsights[];
  loading?: boolean;
  totalFleet?: number;
  expiryBuckets?: BucketPoint[];
}

// Map tab keys to the expected title values
const tabKeyToTitleMap: Record<
  string,
  "expired" | "today" | "in_1_day" | "in_1_week" | "in_1_month" | "in_1_year"
> = {
  expired: "expired",
  today: "today",
  in_1_day: "in_1_day",
  in_1_week: "in_1_week",
  in_1_month: "in_1_month",
  in_1_year: "in_1_year",
};

export function ExpiryInsightsSection({
  data,
  loading,
  totalFleet,
  expiryBuckets = [],
}: ExpiryInsightsSectionProps) {
  const tabDataMap = useMemo(() => {
    const map: Record<string, ExpiryInsights> = {};
    data?.forEach((d) => {
      map[d.status] = d;
    });
    return map;
  }, [data]);

  const expiryTabs: TabConfig[] = useMemo(
    () => [
      {
        key: "expired",
        label: `Expired (${tabDataMap["expired"]?.data.totalDocuments || 0})`,
      },
      {
        key: "today",
        label: `Today (${tabDataMap["today"]?.data.totalDocuments || 0})`,
      },
      {
        key: "in_1_day",
        label: `1 Day (${tabDataMap["in_1_day"]?.data.totalDocuments || 0})`,
      },
      {
        key: "in_1_week",
        label: `1 Week (${tabDataMap["in_1_week"]?.data.totalDocuments || 0})`,
      },
      {
        key: "in_1_month",
        label: `1 Month (${
          tabDataMap["in_1_month"]?.data.totalDocuments || 0
        })`,
      },
      {
        key: "in_1_year",
        label: `1 Year (${tabDataMap["in_1_year"]?.data.totalDocuments || 0})`,
      },
    ],
    [tabDataMap]
  );

  const router = useRouter();

  const renderTabContent = (activeKey: string) => {
    const tabData = tabDataMap[activeKey];
    const cardTitle = tabKeyToTitleMap[activeKey] || "expired";

    const numDocs = tabData?.data.totalDocuments ?? 0;
    const numVehicles = tabData?.data.totalVehicles ?? 0;
    const fleetPercentage = totalFleet
      ? Math.round((numVehicles / totalFleet) * 100)
      : 0;

    const topLinkages =
      tabData?.data.items.slice(0, 3).map((item: VehicleDocumentItem) => ({
        id: item.id,
        documentType: item.documentTypeName,
        vehicleName: item.vehicleName,
        expireStatus: getExpireStatus(String(item.expiryDate)),
      })) ?? [];

    return (
      <div className="space-y-6">
        <ImpactSummaryCard
          numDocs={numDocs}
          numVehicles={numVehicles}
          fleetPercentage={fleetPercentage}
          title={cardTitle}
          onViewAll={() => router.push("/linkages")}
        />

        <AppText size="heading3" variant="secondary">
          Showing top 3 linkages affected
        </AppText>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {topLinkages.map((linkage, idx) => (
            <LinkageCard
              key={idx}
              documentType={linkage.documentType}
              vehicleName={linkage.vehicleName}
              expireStatus={linkage.expireStatus}
              title={cardTitle}
              onViewDetails={() => {
                if (!linkage.id) return;
                router.push(`/entities/vehicle_documents/${linkage.id}`);
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <StatsSection
      title="Expiry Insights"
      icon={<AlertTriangle className="w-5 h-5 text-warning" />}
      loading={loading}
      className="mt-8"
    >
      {/* Tabs + top linkages */}
      <TabbedSection
        tabs={expiryTabs}
        renderContent={(activeKey) => renderTabContent(activeKey as string)}
        showDivider={false}
      />

      {/* Charts section */}
      <ExpiryInsightsCharts expiryBuckets={expiryBuckets} />
    </StatsSection>
  );
}
