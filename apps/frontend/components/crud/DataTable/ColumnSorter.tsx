"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import React from "react";
import clsx from "clsx";

interface ColumnSorterProps {
  field: string;
  label: string;
  currentSort: { field: string; order: "asc" | "desc" } | null;
  onChange: (field: string, order: "asc" | "desc") => void;
}


export const ColumnSorter: React.FC<ColumnSorterProps> = ({
  field,
  label,
  currentSort,
  onChange,
}) => {
  const isActive = currentSort?.field === field;
  const direction = isActive ? currentSort?.order : undefined;

  const handleClick = () => {
    if (!isActive) return onChange(field, "asc");
    onChange(field, direction === "asc" ? "desc" : "asc");
  };

  return (
    <AppButton
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={clsx(
        "flex items-center gap-1 text-sm font-medium",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      <span>{label}</span>
      {isActive ? (
        direction === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
      )}
    </AppButton>
  );
};
