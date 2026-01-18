"use client";

import React, { ReactNode } from "react";
import clsx from "clsx";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { TabConfig, TabbedSection } from "../analytics/layout/SectionWithTabs";
import { componentTokens } from "@/styles/design-system/componentTokens";

export interface EntityDetailsPageProps {
  title: string;
  subtitle?: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  leftActions?: ReactNode;
  tabs: TabConfig[];
  initialTabKey?: string | number;
  renderTab: (activeKey: string | number, activeTab: TabConfig) => ReactNode;
  className?: string;
}

export const EntityDetailsPage: React.FC<EntityDetailsPageProps> = ({
  title,
  subtitle,
  badge,
  actions,
  leftActions,
  tabs,
  initialTabKey,
  renderTab,
  className,
}) => {
  const hasSubtitle = !!subtitle;
  const hasActions = !!actions || !!leftActions;

  return (
    <div className={clsx("flex flex-col gap-5 md:gap-6 pb-8", className)}>
      {/* ──────── Modern Header ──────── */}
      <header
        className={clsx(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between",
          "gap-4 pb-4 border-b border-border-subtle/60",
          componentTokens.layout.pageHeader
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <AppText
            as="h1"
            size="heading1"
            variant="primary"
            className={clsx(
              "truncate",
              "bg-linear-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent",
              "tracking-tight -ml-0.5"
            )}
          >
            {title}
          </AppText>

          {badge && <div className="shrink-0 translate-y-0.5">{badge}</div>}

          {leftActions && (
            <div className="flex items-center gap-2.5 ml-1.5">
              {leftActions}
            </div>
          )}
        </div>

        {(hasActions || hasSubtitle) && (
          <div className="flex items-center gap-4 sm:gap-5 shrink-0">
            {hasSubtitle && (
              <AppText
                size="body"
                variant="secondary"
                className="hidden md:block text-text-tertiary font-medium tracking-tight"
              >
                {subtitle}
              </AppText>
            )}

            {actions && (
              <div className="flex items-center gap-2.5">{actions}</div>
            )}
          </div>
        )}
      </header>

      {hasSubtitle && (
        <AppText
          size="body"
          variant="secondary"
          className="text-text-tertiary md:hidden -mt-2 mb-3 font-medium"
        >
          {subtitle}
        </AppText>
      )}

      {/* ──────── Card + Tabs ──────── */}
      <AppCard
        className={clsx(
          "overflow-hidden shadow-sm",
          "border border-border-subtle/40",
          "bg-card/98 backdrop-blur-[1px]"
        )}
      >
        <TabbedSection
          tabs={tabs}
          initialActiveKey={initialTabKey}
          tabsProps={{
            variant: "underline",
            size: "md",
            fullWidth: true,
            className: "px-5 pt-1.5 pb-0 border-b border-border/60",
            tabClassName: "py-3.5 px-5 font-medium tracking-tight",
            activeTabClassName:
              "text-primary font-semibold after:bg-primary after:h-[2.5px]",
          }}
          contentClassName="bg-transparent my-0!"
          showDivider={false}
          renderContent={(key, tab) => (
            <div className={clsx("", "animate-fade-in duration-200")}>
              {renderTab(key, tab)}
            </div>
          )}
        />
      </AppCard>
    </div>
  );
};
