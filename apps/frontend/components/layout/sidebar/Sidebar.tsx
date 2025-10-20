"use client";

import React from "react";
import clsx from "clsx";
import { useSidebar } from "./useSidebar";
import {
  radius,
  shadow,
  transition,
  theme,
  typography,
} from "../../tokens/designTokens";
import { SidebarNavItem } from "./SidebarNavItem";
import { sidebarConfig } from "./sidebarConfig";
import { LucideArrowLeft, LucideArrowRight } from "lucide-react";

export const Sidebar: React.FC = () => {
  const { isCollapsed, toggle } = useSidebar();
  const t = theme.light;

  const brandItem = sidebarConfig.find((item) => item.type === "brand");

  return (
    <aside
      className={clsx(
        "h-screen flex flex-col bg-white border-r transition-[width]",
        t.colors.border,
        shadow.sm,
        isCollapsed ? "w-16" : "w-64",
        "duration-300 ease-in-out"
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          "flex items-center justify-between p-4 border-b",
          t.colors.border,
          transition.base
        )}
      >
        {!isCollapsed && brandItem && (
          <span className={clsx(typography.heading3, t.colors.textPrimary)}>
            {brandItem.label}
          </span>
        )}
        <button
          onClick={toggle}
          className={clsx(
            "flex items-center justify-center p-1 rounded",
            radius.sm,
            "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200"
          )}
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
      <nav className="flex-1 overflow-y-auto mt-2 px-1">
        {sidebarConfig
          .filter((item) => item.type !== "brand")
          .map((item) =>
            item.children ? (
              <SidebarNavItem
                key={item.label}
                label={item.label}
                icon={item.icon} // render top-level icon always
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
      <div className="p-4 text-xs text-gray-400 border-t border-gray-100">
        {!isCollapsed && <p>v1.0.0</p>}
      </div>
    </aside>
  );
};
