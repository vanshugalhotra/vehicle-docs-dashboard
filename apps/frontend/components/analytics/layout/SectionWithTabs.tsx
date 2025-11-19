"use client";

import React, { useState, ReactNode } from "react";
import { Tabs, TabItem } from "@/components/layout/tab/Tab";
import { AppText } from "@/components/ui/AppText";
import clsx from "clsx";

export interface SectionTabConfig {
  key: string | number;
  label: string;
  icon?: ReactNode;
  contentLeft?: ReactNode;
  contentMiddle?: ReactNode;
  contentRight?: ReactNode;
  disabled?: boolean;
}

export interface SectionWithTabsProps {
  title?: string;
  description?: string;
  titleVariant?: "h1" | "h2" | "h3";
  tabs: SectionTabConfig[];
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

export const SectionWithTabs: React.FC<SectionWithTabsProps> = ({
  title,
  description,
  titleVariant = "h2",
  tabs,
  initialActiveKey,
  className,
  headerClassName,
  contentClassName,
  tabsProps,
  vertical = false,
  gap = "gap-6",
  showDivider = false,
  loading = false,
  skeletonCount = 3,
}) => {
  const [activeKey, setActiveKey] = useState<string | number>(initialActiveKey ?? tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === activeKey);
  const hasMiddleContent = activeTab?.contentMiddle;
  const hasRightContent = activeTab?.contentRight;

  const tabItems: TabItem[] = tabs.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
    disabled: t.disabled,
  }));

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <div key={i} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 h-40 bg-border-subtle rounded-lg animate-pulse" />
          {hasMiddleContent && <div className="flex-1 h-40 bg-border-subtle rounded-lg animate-pulse" />}
          {hasRightContent && <div className="flex-1 h-40 bg-border-subtle rounded-lg animate-pulse" />}
        </div>
      ))}
    </div>
  );

  return (
    <section className={clsx("w-full", className)}>
      {(title || description) && (
        <div className={clsx("mb-6 pb-4", headerClassName)}>
          {title && (
            <AppText as={titleVariant} size={"heading2"} className="font-bold text-text-primary tracking-tight mb-2">
              {title}
            </AppText>
          )}
          {description && (
            <AppText size="body" variant="secondary" className="text-text-tertiary leading-relaxed">
              {description}
            </AppText>
          )}
        </div>
      )}

      <Tabs items={tabItems} activeKey={activeKey} onChange={setActiveKey} orientation={vertical ? "vertical" : "horizontal"} {...tabsProps} />

      {showDivider && <div className="my-6 h-px bg-border-subtle/50" />}

      <div
        className={clsx("flex flex-col md:flex-row my-6", vertical ? "flex-row items-start" : "items-stretch", gap, contentClassName, loading && "opacity-75 pointer-events-none")}
        role="tabpanel"
        aria-labelledby={`tab-${activeKey}`}
      >
        {loading ? renderSkeleton() : (
          <>
            <div className="flex-1">{activeTab?.contentLeft}</div>
            {hasMiddleContent && <div className="flex-1 md:pl-4 mt-4 md:mt-0">{activeTab.contentMiddle}</div>}
            {hasRightContent && <div className="flex-1 md:pl-4 mt-4 md:mt-0">{activeTab.contentRight}</div>}
          </>
        )}
      </div>
    </section>
  );
};
