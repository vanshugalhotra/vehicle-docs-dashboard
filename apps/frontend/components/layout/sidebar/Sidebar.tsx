"use client";

import React from "react";
import clsx from "clsx";
import { useSidebar } from "./useSidebar";
import { componentTokens } from "@/styles/design-system";
import { SidebarNavItem } from "./SidebarNavItem";
import { sidebarConfig } from "./sidebarConfig";
import { LucideArrowLeft, LucideArrowRight } from "lucide-react";
import { AppText } from "@/components/ui/AppText";

export const Sidebar: React.FC = () => {
  const { isCollapsed, toggle } = useSidebar();

  const brandItem = sidebarConfig.find((item) => item.type === "brand");

  return (
    <aside
      className={clsx(
        componentTokens.sidebar.base,
        isCollapsed ? componentTokens.sidebar.collapsed : componentTokens.sidebar.expanded
      )}
    >
      {/* Header */}
      <div className={componentTokens.sidebar.header}>
        {!isCollapsed && brandItem && (
          <AppText size="heading2">
            {brandItem.label}
          </AppText>

        )}
        <button
          onClick={toggle}
          className={componentTokens.sidebar.toggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <LucideArrowRight size={20} />
          ) : (
            <LucideArrowLeft size={20} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={componentTokens.sidebar.nav}>
        {sidebarConfig
          .filter((item) => item.type !== "brand")
          .map((item) =>
            item.children ? (
              <SidebarNavItem
                key={item.label}
                label={item.label}
                icon={item.icon}
              >
                {!isCollapsed &&
                  item.children.map((child) => (
                    <SidebarNavItem
                      key={child.label}
                      label={child.label}
                      icon={child.icon}
                      path={child.path}
                    />
                  ))}
              </SidebarNavItem>
            ) : (
              <SidebarNavItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                path={item.path}
              />
            )
          )}
      </nav>

      {/* Footer */}
      <div className={componentTokens.sidebar.footer}>
        {!isCollapsed && <p>v1.0.0</p>}
      </div>
    </aside>
  );
};