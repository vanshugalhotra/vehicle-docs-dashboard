"use client";

import React from "react";
import { componentTokens } from "@/styles/design-system/componentTokens";
import { HeaderBar } from "./HeaderBar/HeaderBar";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "../ui/AppButton";
import { toastUtils } from "@/lib/utils/toastUtils";
import { Download } from "lucide-react";

interface CRUDPageLayoutProps {
  title: string;
  isEditing?: boolean;
  onCancelEdit?: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  form: React.ReactNode;
  table: React.ReactNode;
  footer?: React.ReactNode;
  layout?: "side-by-side" | "stacked";

  rightActions?: React.ReactNode;
}

/**
 * Generic layout for all CRUD pages (form + table + header).
 */
export const CRUDPageLayout: React.FC<CRUDPageLayoutProps> = ({
  title,
  isEditing,
  onCancelEdit,
  search,
  onSearchChange,
  addLabel,
  form,
  table,
  footer,
  layout = "side-by-side",
  rightActions,
}) => {
  const exportAction = (
    <AppButton
      variant="primary"
      size="md"
      onClick={() => toastUtils.info("Export feature coming soon")}
      endIcon={<Download size={16} />}
    >
      Export
    </AppButton>
  );

  const mergedRightActions = (
    <div className="flex items-center gap-2">
      {exportAction}
      {rightActions}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Conditional Layout */}
      {layout === "side-by-side" ? (
        <>
          {/* Header */}
          <HeaderBar
            title={title}
            isEditing={isEditing}
            onCancelEdit={onCancelEdit}
            search={search}
            onSearchChange={onSearchChange}
            addLabel={addLabel}
            rightActions={mergedRightActions}
          />

          <div className="grid lg:grid-cols-3 gap-4 min-h-0 h-full">
            {/* Left Column: Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-0">{form}</div>
            </div>

            {/* Right Column: Table */}
            <div className="lg:col-span-2 flex flex-col min-h-0">
              <AppCard
                className={
                  componentTokens.card.base + " flex-1 flex flex-col min-h-0"
                }
                padded={false}
              >
                <div className="flex-1 overflow-auto">{table}</div>
              </AppCard>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Top: Form */}
          <div>{form}</div>

          {/* Middle: Header */}
          <HeaderBar
            title={title}
            isEditing={isEditing}
            onCancelEdit={onCancelEdit}
            search={search}
            onSearchChange={onSearchChange}
            addLabel={addLabel}
            rightActions={mergedRightActions}
          />

          {/* Bottom: Table */}
          <div className="flex-1 flex flex-col min-h-0">
            <AppCard
              className={
                componentTokens.card.base + " flex-1 flex flex-col min-h-0"
              }
              padded={false}
            >
              <div className="flex-1 overflow-auto">{table}</div>
            </AppCard>
          </div>
        </>
      )}

      {/* Optional Footer (modals / dialogs) */}
      {footer && <div>{footer}</div>}
    </div>
  );
};
