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
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <HeaderBar
        title={title}
        isEditing={isEditing}
        onCancelEdit={onCancelEdit}
        search={search}
        onSearchChange={onSearchChange}
        addLabel={addLabel}
        rightActions={
          <div className="flex items-center gap-2">
            <AppButton
              variant="primary"
              size="md"
              onClick={() => toastUtils.info("Export feature coming soon")}
              endIcon={<Download size={16}/>}
            >
              Export
            </AppButton>
          </div>
        }
      />

      {/* Grid Layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left Column: Form */}
        <div className="lg:col-span-1">{form}</div>

        {/* Right Column: Table */}
        <div className="lg:col-span-2">
          <AppCard className={componentTokens.card.base} padded={false}>
            {table}
          </AppCard>
        </div>
      </div>

      {/* Optional Footer (modals / dialogs) */}
      {footer && <div>{footer}</div>}
    </div>
  );
};
