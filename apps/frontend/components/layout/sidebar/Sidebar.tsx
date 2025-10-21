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
          <span className={componentTokens.sidebar.brand}>
            <AppText size="heading1">{brandItem.label}</AppText>
          </span>
        )}
        <button
          onClick={toggle}
          className={componentTokens.sidebar.toggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
          .map((item, ) => (
            <React.Fragment key={item.label}>
              {item.children ? (
                <SidebarNavItem
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
              )}
            </React.Fragment>
          ))}
      </nav>

      {/* Footer */}
      <div className={componentTokens.sidebar.footer}>
        {!isCollapsed && (
          <span className={componentTokens.sidebar.footerVersion}>
            © helpmefolks
          </span>
        )}
      </div>
    </aside>
  );
};