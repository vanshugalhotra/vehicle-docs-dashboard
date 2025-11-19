"use client";

import React from "react";
import { SectionWithTabs } from "@/components/analytics/layout/SectionWithTabs";
import { vehiclesByGroupTabs, VehiclesGroupBy } from "@/configs/analytics/vehiclesByGroup.config";
import { GroupedPoint } from "@/lib/types/stats.types";
import { StatsSection } from "../layout/StatsSection";

interface VehiclesByGroupSectionProps {
  data?: Partial<Record<VehiclesGroupBy, GroupedPoint[]>>; // keyed by category/location/owner/driver
  isLoading?: boolean;
}

export const VehiclesByGroupSection: React.FC<VehiclesByGroupSectionProps> = ({
  data,
  isLoading = false,
}) => {
  return (
    <StatsSection title="Vehicles By Group" loading={isLoading}>
      <SectionWithTabs
        tabs={vehiclesByGroupTabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          contentLeft: tab.renderLeftChart(data?.[tab.key] || []),
          contentMiddle: tab.renderMiddleChart?.(data?.[tab.key] || []),
          contentRight: tab.renderRightContent?.(data?.[tab.key] || []),
        }))}
      />
    </StatsSection>
  );
};
