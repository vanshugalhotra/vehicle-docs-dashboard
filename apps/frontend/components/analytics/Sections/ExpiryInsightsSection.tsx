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
import { ExpiryInsights, VehicleDocumentItem } from "@/lib/types/stats.types";
import { getExpireStatus } from "@/lib/utils/dateUtils";
import { useRouter } from "next/navigation";
import { AppText } from "@/components/ui/AppText";

interface ExpiryInsightsSectionProps {
  data?: ExpiryInsights[]; // data for all tabs
  loading?: boolean;
  totalFleet?: number; // optional, for fleet percentage calculation
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
}: ExpiryInsightsSectionProps) {
  const tabDataMap = useMemo(() => {
    const map: Record<string, ExpiryInsights> = {};
    data?.forEach((d) => {
      map[d.status] = d;
    });
    return map;
  }, [data]);

  // Create tabs with counts
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

    // Get the correct title for the cards
    const cardTitle = tabKeyToTitleMap[activeKey] || "expired";

    const numDocs = tabData?.data.totalDocuments ?? 0;
    const numVehicles = tabData?.data.totalVehicles ?? 0;
    const fleetPercentage = totalFleet
      ? Math.round((numVehicles / totalFleet) * 100)
      : 0;

    // Map top 3 VehicleDocumentItems to LinkageCard format
    const topLinkages: {
      documentType: string;
      vehicleName: string;
      expireStatus: string;
    }[] =
      tabData?.data.items.slice(0, 3).map((item: VehicleDocumentItem) => ({
        documentType: item.documentTypeName,
        vehicleName: item.vehicleName,
        expireStatus: getExpireStatus(String(item.expiryDate)),
      })) ?? [];

    return (
      <div className="space-y-6">
        {/* Top Summary */}
        <ImpactSummaryCard
          numDocs={numDocs}
          numVehicles={numVehicles}
          fleetPercentage={fleetPercentage}
          title={cardTitle}
          onViewAll={() => {router.push('/linkages')}}
        />

        {/* Top 3 Linkages */}
        <AppText size="heading3" variant="secondary">Showing top 3 linkages affected</AppText>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {topLinkages.map((linkage, idx) => (
            <LinkageCard
              key={idx}
              documentType={linkage.documentType}
              vehicleName={linkage.vehicleName}
              expireStatus={linkage.expireStatus}
              title={cardTitle}
              onViewDetails={() => {}}
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
      <TabbedSection
        tabs={expiryTabs}
        renderContent={(activeKey) => renderTabContent(activeKey as string)}
        showDivider={false}
      />
    </StatsSection>
  );
}