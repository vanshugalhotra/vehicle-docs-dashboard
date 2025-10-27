"use client";
import React from "react";
import { AppText } from "../../ui/AppText";

interface DataTableEmptyStateProps {
  title?: string;
  description?: string;
}

export const DataTableEmptyState = ({
  title = "No records found",
  description = "Try adjusting your search criteria or add a new record to get started.",
}: DataTableEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="w-14 h-14 bg-linear-to-br from-surface-muted to-surface-muted/50 rounded-full flex items-center justify-center">
        <svg
          className="w-7 h-7 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <AppText size="body" variant="muted" className="font-medium">
        {title}
      </AppText>
      <AppText
        size="label"
        variant="muted"
        className="max-w-md text-center opacity-75"
      >
        {description}
      </AppText>
    </div>
  );
};
