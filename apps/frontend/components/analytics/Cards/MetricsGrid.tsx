"use client";
import React from "react";
import clsx from "clsx";

interface MetricsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function MetricsGrid({ children, className }: MetricsGridProps) {
  return (
    <div
      className={clsx(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}
