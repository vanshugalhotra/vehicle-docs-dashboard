"use client";

import React from "react";
import { HeaderBar } from "@/components/crud/HeaderBar/HeaderBar";
import { AppCard } from "@/components/ui/AppCard";
import VehicleSelector from "./VehicleSelector";
import DocumentTypeSelector from "./DocumentTypeSelector";

export default function LinkagePage() {
  return (
    <div className="flex flex-col space-y-6">
      <HeaderBar title="Link Vehicle Documents"></HeaderBar>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col space-y-4 h-full">
          <AppCard
            bordered
            hoverable
            padded
            className="flex-1 flex flex-col min-h-[300px]"
          >
            <VehicleSelector />
          </AppCard>
        </div>

        <div className="flex flex-col space-y-4 h-full">
          <AppCard
            bordered
            hoverable
            padded
            className="flex-1 flex flex-col min-h-[300px]"
          >
            <DocumentTypeSelector />
          </AppCard>
        </div>
      </div>
    </div>
  );
}
