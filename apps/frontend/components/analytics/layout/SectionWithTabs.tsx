"use client";

import React, { useState, ReactNode } from "react";
import { Tabs, TabItem } from "@/components/layout/tab/Tab";
import { AppText } from "@/components/ui/AppText";
import clsx from "clsx";

export interface TabConfig {
  key: string | number;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  /** Optional: Add any custom data you need */
  data?: unknown;
}

export interface TabbedSectionProps {
  title?: string;
  description?: string;
  titleVariant?: "h1" | "h2" | "h3";
  tabs: TabConfig[];
  initialActiveKey?: string | number;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  tabsProps?: Partial<React.ComponentProps<typeof Tabs>>;
  vertical?: boolean;
  showDivider?: boolean;
  loading?: boolean;
  skeletonCount?: number;
  children?: ReactNode;
  /** Render prop for tab content */
  renderContent?: (activeKey: string | number, activeTab: TabConfig) => ReactNode;
}

export const TabbedSection: React.FC<TabbedSectionProps> = ({
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
  showDivider = false,
  loading = false,
  skeletonCount = 3,
  children,
  renderContent,
}) => {
  const [activeKey, setActiveKey] = useState<string | number>(initialActiveKey ?? tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === activeKey);

  const tabItems: TabItem[] = tabs.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
    disabled: t.disabled,
  }));

  const renderSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <div key={i} className="h-40 bg-border-subtle rounded-lg animate-pulse" />
      ))}
    </div>
  );

  return (
    <section className={clsx("w-full", className)}>
      {/* Header */}
      {(title || description) && (
        <div className={clsx("mb-6", headerClassName)}>
          {title && (
            <AppText 
              as={titleVariant} 
              size="heading2" 
              className="font-bold text-text-primary tracking-tight mb-2"
            >
              {title}
            </AppText>
          )}
          {description && (
            <AppText 
              size="body" 
              variant="secondary" 
              className="text-text-tertiary leading-relaxed"
            >
              {description}
            </AppText>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs 
        items={tabItems} 
        activeKey={activeKey} 
        onChange={setActiveKey} 
        orientation={vertical ? "vertical" : "horizontal"} 
        {...tabsProps} 
      />

      {showDivider && <div className="my-6 h-px bg-border-subtle/50" />}

      {/* Content */}
      <div 
        className={clsx(
          "my-6", 
          contentClassName,
          loading && "opacity-75 pointer-events-none"
        )}
        role="tabpanel"
        aria-labelledby={`tab-${activeKey}`}
      >
        {loading ? renderSkeleton() : (
          <>
            {renderContent && activeTab && renderContent(activeKey, activeTab)}
            {children}
          </>
        )}
      </div>
    </section>
  );
};