"use client";

import React, { useMemo } from "react";
import { StatsSection } from "@/components/analytics/layout/StatsSection";
import { TabbedSection, TabConfig } from "@/components/analytics/layout/SectionWithTabs";
import { ImpactSummaryCard } from "@/components/analytics/Cards/ImpactSummaryCard";
import { LinkageCard } from "@/components/analytics/Cards/LinkageCard";
import { AlertTriangle } from "lucide-react";
import { ExpiryInsights, VehicleDocumentItem } from "@/lib/types/stats.types";

interface ExpiryInsightsSectionProps {
  data?: ExpiryInsights[]; // data for all tabs
  loading?: boolean;
  totalFleet?: number; // optional, for fleet percentage calculation
}

// Map tab keys to the expected title values
const tabKeyToTitleMap: Record<string, "expired" | "today" | "in_1_day" | "in_1_week" | "in_1_month" | "in_1_year"> = {
  "expired": "expired",
  "today": "today", 
  "in_1_day": "in_1_day",
  "in_1_week": "in_1_week",
  "in_1_month": "in_1_month",
  "in_1_year": "in_1_year",
};

const expiryTabs: TabConfig[] = [
  { key: "expired", label: "Expired" },
  { key: "today", label: "Today" },
  { key: "in_1_day", label: "1 Day" },
  { key: "in_1_week", label: "1 Week" },
  { key: "in_1_month", label: "1 Month" },
  { key: "in_1_year", label: "1 Year" },
];

// Helper function to calculate days difference and generate status text
const getExpireStatus = (expiryDate: string): string => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  
  // Reset time part for accurate day calculation
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Expires today";
  } else if (diffDays === 1) {
    return "Expires tomorrow";
  } else if (diffDays > 1) {
    return `Expires in ${diffDays} days`;
  } else if (diffDays === -1) {
    return "Expired yesterday";
  } else {
    return `Expired ${Math.abs(diffDays)} days ago`;
  }
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

  const renderTabContent = (activeKey: string) => {
    const tabData = tabDataMap[activeKey];
    
    // Get the correct title for the cards
    const cardTitle = tabKeyToTitleMap[activeKey] || "expired";

    const numDocs = tabData?.data.totalDocuments ?? 0;
    const numVehicles = tabData?.data.totalVehicles ?? 0;
    const fleetPercentage = totalFleet ? Math.round((numVehicles / totalFleet) * 100) : 0;

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
          onViewAll={() => {}}
        />

        {/* Top 3 Linkages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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