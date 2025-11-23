"use client";

import React, { ReactNode } from "react";
import { TabbedSection, TabConfig } from "./SectionWithTabs";
import clsx from "clsx";
import { Tabs } from "@/components/layout/tab/Tab";

export interface ThreeColumnTabConfig extends TabConfig {
  contentLeft?: ReactNode;
  contentMiddle?: ReactNode;
  contentRight?: ReactNode;
}

export interface ThreeColumnTabbedSectionProps {
  title?: string;
  description?: string;
  titleVariant?: "h1" | "h2" | "h3";
  tabs: ThreeColumnTabConfig[];
  initialActiveKey?: string | number;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  tabsProps?: Partial<React.ComponentProps<typeof Tabs>>;
  vertical?: boolean;
  gap?: string;
  showDivider?: boolean;
  loading?: boolean;
  skeletonCount?: number;
}

export const GraphTabGroup: React.FC<
  ThreeColumnTabbedSectionProps
> = ({ tabs, gap = "gap-6", loading = false, skeletonCount = 3, ...props }) => {
  const renderThreeColumnContent = (
    activeKey: string | number,
    activeTab: ThreeColumnTabConfig
  ) => {
    const hasMiddleContent = activeTab?.contentMiddle;
    const hasRightContent = activeTab?.contentRight;

    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-40 bg-border-subtle rounded-lg animate-pulse" />
              {hasMiddleContent && (
                <div className="flex-1 h-40 bg-border-subtle rounded-lg animate-pulse" />
              )}
              {hasRightContent && (
                <div className="flex-1 h-40 bg-border-subtle rounded-lg animate-pulse" />
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={clsx("flex flex-col md:flex-row", gap)}>
        <div className="flex-1">{activeTab?.contentLeft}</div>
        {hasMiddleContent && (
          <div className="flex-1 md:pl-4 mt-4 md:mt-0">
            {activeTab.contentMiddle}
          </div>
        )}
        {hasRightContent && (
          <div className="flex-1 md:pl-4 mt-4 md:mt-0">
            {activeTab.contentRight}
          </div>
        )}
      </div>
    );
  };

  return (
    <TabbedSection
      {...props}
      tabs={tabs}
      renderContent={renderThreeColumnContent}
      loading={loading}
    />
  );
};
