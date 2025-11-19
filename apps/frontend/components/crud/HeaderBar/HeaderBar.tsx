"use client";

import React, { useState, useEffect } from "react";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppInput } from "@/components/ui/AppInput";
import { componentTokens } from "@/styles/design-system/componentTokens";
import { Search, X } from "lucide-react";
import clsx from "clsx";

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

  const hasSearch = !!onSearchChange;
  const showCancelEdit = isEditing && onCancelEdit;

  return (
    <div className={componentTokens.layout.pageHeader}>
      {/* Left Section — Title & Edit Badge */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <AppText 
          size="heading2" 
          variant="primary" 
          className="truncate font-bold bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent"
        >
          {title}
        </AppText>

        {isEditing && (
          <AppBadge variant="info" size="sm" className="animate-pulse">
            <AppText size="caption" variant="secondary" className="font-medium">
              Editing
            </AppText>
          </AppBadge>
        )}

        {/* Optional Custom Controls (left side) */}
        {children}
      </div>

      {/* Right Section — Actions */}
      <div className={clsx(
        "flex items-center gap-3 shrink-0",
        hasSearch && "gap-2"
      )}>
        {/* Optional Search Input */}
        {hasSearch && (
          <div className="relative group">
            <AppInput
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-64 pr-10 transition-all duration-200 group-focus-within:w-72"
              prefixIcon={<Search size={18} className="text-text-tertiary group-focus-within:text-primary" />}
              suffixIcon={
                localSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalSearch("");
                      onSearchChange?.("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-primary transition-colors"
                  >
                    <X size={16} />
                  </button>
                )
              }
            />
          </div>
        )}

        {/* Cancel Edit Button */}
        {showCancelEdit && (
          <AppButton
            onClick={onCancelEdit}
            size="sm"
            variant="outline"
            className="px-4 py-2 transition-all duration-200 hover:scale-105 shadow-sm"
          >
            <X size={16} className="mr-1" />
            Cancel
          </AppButton>
        )}

        {/* Right-side Actions */}
        <div className="flex items-center gap-2">
          {rightActions}
        </div>
      </div>
    </div>
  );
};