"use client";

import React from "react";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppInput } from "@/components/ui/AppInput";
import { componentTokens } from "@/styles/design-system/componentTokens";
import { Search } from "lucide-react";

interface HeaderBarProps {
  /** Page or section title */
  title: string;

  /** Current search term */
  search?: string;

  /** Callback when search changes */
  onSearchChange?: (value: string) => void;

  /** Text for Add button (default: "Add") */
  addLabel?: string;

  /** Editing mode flag */
  isEditing?: boolean;

  /** Cancel editing callback */
  onCancelEdit?: () => void;

  /** Extra filters or left-side controls */
  children?: React.ReactNode;

  /** Right-side actions (buttons, etc.) */
  rightActions?: React.ReactNode;
}

/**
 * Reusable CRUD page header bar with title, add button, search input,
 * edit mode indicator, and slots for extra controls.
 */
export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  search,
  onSearchChange,
  isEditing = false,
  onCancelEdit,
  children,
  rightActions,
}) => {
  return (
    <div className={componentTokens.layout.pageHeader}>
      {/* Left Section — Title & Edit Badge */}
      <div className="flex items-center gap-4">
        <AppText size="heading2" variant="primary">
          {title}
        </AppText>
        {isEditing && (
          <AppBadge variant="info">
            <AppText size="caption" variant="secondary">
              Editing Mode
            </AppText>
          </AppBadge>
        )}
        {/* Optional Custom Controls (left side) */}
        {children}
      </div>

      {/* Right Section — Actions */}
      <div className="flex items-center gap-3">
        {/* Optional Search Input */}
        {onSearchChange && (
          <AppInput
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-lg max-w-lg"
            prefixIcon={<Search size={18}/>}
          />
        )}

        {/* Cancel Edit Button */}
        {isEditing && onCancelEdit && (
          <AppButton onClick={onCancelEdit} size="sm" variant="secondary" className="px-6">
            Cancel Edit
          </AppButton>
        )}

        {/* Right-side Actions */}
        {rightActions}
      </div>
    </div>
  );
};