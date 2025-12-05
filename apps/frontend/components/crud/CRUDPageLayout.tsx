"use client";

import React from "react";
import { componentTokens } from "@/styles/design-system/componentTokens";
import { HeaderBar } from "./HeaderBar/HeaderBar";
import { AppCard } from "@/components/ui/AppCard";
import { ExportType } from "@/lib/types/export.types";
import { ExportAction } from "../actions/ExportAction";

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
  exportTable?: ExportType;
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
  exportTable,
}) => {
  const mergedRightActions = (
    <div className="flex items-center gap-2">
      <ExportAction exportTable={exportTable} />
      {rightActions}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Conditional Layout */}
      {layout === "side-by-side" ? (
        <>
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
            <div className="lg:col-span-1">
              <div className="sticky top-0">{form}</div>
            </div>

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
          <div>{form}</div>

          <HeaderBar
            title={title}
            isEditing={isEditing}
            onCancelEdit={onCancelEdit}
            search={search}
            onSearchChange={onSearchChange}
            addLabel={addLabel}
            rightActions={mergedRightActions}
          />

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

      {footer && <div>{footer}</div>}
    </div>
  );
};
