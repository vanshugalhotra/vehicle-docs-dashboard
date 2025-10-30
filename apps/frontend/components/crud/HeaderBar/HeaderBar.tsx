"use client";

import React, { useState, useEffect } from "react";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppInput } from "@/components/ui/AppInput";
import { componentTokens } from "@/styles/design-system/componentTokens";
import { Search } from "lucide-react";

interface HeaderBarProps {
  title: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  addLabel?: string;
  isEditing?: boolean;
  onCancelEdit?: () => void;
  children?: React.ReactNode;
  rightActions?: React.ReactNode;
  /** Debounce delay in ms (default 400) */
  debounceMs?: number;
}

/**
 * Reusable CRUD page header bar with title, add button, search input,
 * edit mode indicator, and slots for extra controls.
 */
export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  search = "",
  onSearchChange,
  isEditing = false,
  onCancelEdit,
  children,
  rightActions,
  debounceMs = 400,
}) => {
  // Local search state for smooth typing
  const [localSearch, setLocalSearch] = useState(search);

  // Sync external -> local
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce + notify parent
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearchChange && localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, debounceMs);
    return () => clearTimeout(handler);
  }, [localSearch, debounceMs, onSearchChange, search]);

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
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-lg max-w-lg"
            prefixIcon={<Search size={18} />}
          />
        )}

        {/* Cancel Edit Button */}
        {isEditing && onCancelEdit && (
          <AppButton
            onClick={onCancelEdit}
            size="sm"
            variant="secondary"
            className="px-6"
          >
            Cancel Edit
          </AppButton>
        )}

        {/* Right-side Actions */}
        {rightActions}
      </div>
    </div>
  );
};
