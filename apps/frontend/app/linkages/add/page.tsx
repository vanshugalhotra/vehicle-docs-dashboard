"use client";

import React from "react";
import { PageWrapper } from "@/components/layout/pagewrapper";
import { AppText } from "@/components/ui/AppText";
import { AppCard } from "@/components/ui/AppCard";
import { componentTokens } from "@/styles/design-system";
import VehicleSelector from "./VehicleSelector";

export default function LinkagePage() {
  return (
    <PageWrapper>
      <div className="flex flex-col gap-6">
        {/* 🏷️ Header Section */}
        <div>
          <AppText size="heading2" className={componentTokens.text.primary}>
            Link Vehicle Documents
          </AppText>
          <AppText size="body" className={componentTokens.text.bodySecondary}>
            Select a vehicle below to start adding or viewing its document
            linkages.
          </AppText>
        </div>

        {/* 🚘 Vehicle Selection Panel */}
        <AppCard bordered padded hoverable>
          <VehicleSelector />
        </AppCard>
      </div>
    </PageWrapper>
  );
}
