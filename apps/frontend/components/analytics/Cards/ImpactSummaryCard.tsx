"use client";
import React, { FC } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { FileText, Truck, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import {
  getCardConfig,
  getColorScheme,
  getUrgencyBadge,
} from "../layout/colorScheme";

interface SummaryCardProps {
  numDocs: number;
  numVehicles: number;
  fleetPercentage: number;
  onViewAll?: () => void;
  className?: string;
  title?: "expired" | "today" | "in_1_day" | "in_1_week" | "in_1_month" | "in_1_year";
  variant?: "minimal" | "elevated";
  size?: "sm" | "md";
}

export const ImpactSummaryCard: FC<SummaryCardProps> = ({
  numDocs,
  numVehicles,
  fleetPercentage,
  onViewAll,
  className,
  title = "expired",
  variant = "elevated",
  size = "md",
}) => {
  const config = getCardConfig(title);
  const colors = getColorScheme(config.color);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "p-4",
    md: "p-5",
  };

  const variantClasses = {
    minimal: "bg-white border border-gray-200",
    elevated:
      "bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300",
  };

  return (
    <AppCard
      padded={false}
      bordered={false}
      className={clsx(
        "flex flex-col w-full relative group",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <div className="flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className={clsx("p-2 rounded-xl", colors.light)}>
              <IconComponent className={clsx("w-5 h-5", colors.primary)} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <AppText size="heading3" className="font-bold text-gray-900">
                  {config.title}
                </AppText>
                <span
                  className={clsx(
                    "px-2 py-1 rounded-full text-xs font-semibold",
                    colors.badge
                  )}
                >
                  {getUrgencyBadge(config.urgency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Documents */}
          <div
            className={clsx(
              "flex flex-col items-center text-center p-3 rounded-lg transition-all duration-200 hover:scale-105",
              colors.metricBg
            )}
          >
            <FileText className={clsx("w-4 h-4 mb-2", colors.metricIcon)} />
            <AppText size="heading3" className="font-bold text-gray-900 mb-1">
              {numDocs.toLocaleString()}
            </AppText>
            <AppText size="body" className="text-gray-600 font-medium">
              Documents
            </AppText>
          </div>

          {/* Vehicles */}
          <div
            className={clsx(
              "flex flex-col items-center text-center p-3 rounded-lg transition-all duration-200 hover:scale-105",
              colors.metricBg
            )}
          >
            <Truck className={clsx("w-4 h-4 mb-2", colors.metricIcon)} />
            <AppText size="heading3" className="font-bold text-gray-900 mb-1">
              {numVehicles.toLocaleString()}
            </AppText>
            <AppText size="body" className="text-gray-600 font-medium">
              Vehicles
            </AppText>
          </div>

          {/* Impact Percentage */}
          <div
            className={clsx(
              "flex flex-col items-center text-center p-3 rounded-lg transition-all duration-200 hover:scale-105",
              colors.metricBg
            )}
          >
            <AlertTriangle className={clsx("w-4 h-4 mb-2", colors.primary)} />
            <AppText
              size="heading2"
              className={clsx("font-bold mb-1", colors.primary)}
            >
              {fleetPercentage}%
            </AppText>
            <AppText size="body" className="text-gray-600 font-medium">
              Impacted
            </AppText>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <AppText size="body" className="text-gray-500">
            {fleetPercentage}% of fleet vehicles affected
          </AppText>

          <AppButton
            onClick={onViewAll}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 font-semibold transition-all duration-200",
              colors.button
            )}
          >
            View Linkages
          </AppButton>
        </div>
      </div>
    </AppCard>
  );
};
