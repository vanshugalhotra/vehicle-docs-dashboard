"use client";
import React, { FC } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { FileText } from "lucide-react";
import clsx from "clsx";
import { getStatusConfig, getColorScheme } from "../layout/colorScheme";

interface LinkageCardProps {
  documentType: string;
  vehicleName: string;
  expireStatus: string;
  title?:
    | "expired"
    | "today"
    | "in_1_day"
    | "in_1_week"
    | "in_1_month"
    | "in_1_year";
  onViewDetails?: () => void;
  className?: string;
  variant?: "minimal" | "elevated";
}

export const LinkageCard: FC<LinkageCardProps> = ({
  documentType,
  vehicleName,
  title="expired",
  onViewDetails,
  expireStatus,
  className,
  variant = "elevated",
}) => {
  const statusConfig = getStatusConfig(title);
  const colors = getColorScheme(statusConfig.color);
  const IconComponent = statusConfig.icon;

  const variantClasses = {
    minimal: "bg-white border border-gray-200",
    elevated:
      "bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300",
  };

  return (
    <AppCard
      padded={false}
      bordered={false}
      className={clsx(
        "flex flex-col w-full relative group p-3",
        variantClasses[variant],
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Header - Document Type & Vehicle Name */}
        <div className="flex items-start gap-3">
          <div className={clsx("p-2 rounded-lg shrink-0", colors.light)}>
            <FileText className={clsx("w-4 h-4", colors.primary)} />
          </div>
          <div className="flex-1 min-w-0">
            <AppText
              size="body"
              className="font-semibold text-gray-900 wrap-break-word"
            >
              {documentType} – {vehicleName}
            </AppText>
          </div>
        </div>

        {/* Status & CTA */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={clsx("p-1.5 rounded-md shrink-0", colors.light)}>
              <IconComponent className={clsx("w-3.5 h-3.5", colors.primary)} />
            </div>
            <AppText 
              size="body" 
              className={clsx("font-medium wrap-break-word flex-1 min-w-0")}
            >
              {expireStatus}
            </AppText>
          </div>

          {/* CTA Button */}
          <AppButton
            onClick={onViewDetails}
            size="sm"
            className={clsx(
              "flex items-center gap-1 px-3 py-1.5 font-medium transition-all duration-200 whitespace-nowrap text-sm shrink-0",
              colors.button
            )}
          >
            View
          </AppButton>
        </div>
      </div>
    </AppCard>
  );
};