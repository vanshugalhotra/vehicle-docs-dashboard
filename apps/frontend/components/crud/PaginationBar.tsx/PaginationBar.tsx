"use client";

import React from "react";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

export interface PaginationBarProps {
  page: number;
  pageSize: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  pageSize,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  isLoading = false,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalCount);

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  const handlePageSizeChange = (opt: { value: string }) => {
    onPageSizeChange(Number(opt.value));
  };

  const currentValue = {
    label: `${pageSize}`,
    value: String(pageSize),
  };

  return (
    <div
      className={clsx(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 px-4 bg-surface border-t border-border-subtle",
        isLoading && "opacity-60"
      )}
    >
      {/* Left: Entries selector */}
      <div className="flex items-center gap-2 order-2 sm:order-1">
        <AppText size="label" variant="secondary">
          Show
        </AppText>
        <AppSelect
          options={pageSizeOptions.map((s) => ({
            label: `${s}`,
            value: String(s),
          }))}
          value={currentValue}
          onChange={handlePageSizeChange}
          disabled={isLoading}
          className="w-16"
        />
        <AppText size="label" variant="secondary">
          per page
        </AppText>
      </div>

      {/* Center: Results summary */}
      <div className="flex-1 flex justify-center order-1 sm:order-2">
        <AppText size="label" variant="secondary" className="text-center">
          Showing{" "}
          <span className="text-text-primary font-medium">
            {start}–{end}
          </span>{" "}
          of <span className="text-text-primary font-medium">{totalCount}</span>
        </AppText>
      </div>

      {/* Right: Navigation */}
      <div className="flex items-center gap-2 justify-center sm:justify-end order-3">
        <AppButton
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={page === 1 || isLoading}
          startIcon={<ChevronLeft size={16} />}
          className="min-w-8 h-8"
        />

        <div className="flex items-center px-2">
          <AppText size="label" variant="secondary">
            Page{" "}
            <span className="text-text-primary font-medium">{page}</span> of{" "}
            <span className="text-text-primary font-medium">{totalPages}</span>
          </AppText>
        </div>

        <AppButton
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={page >= totalPages || isLoading}
          endIcon={<ChevronRight size={16} />}
          className="min-w-8 h-8"
        />
      </div>
    </div>
  );
};