"use client";
import React from "react";
import clsx from "clsx";
import { useSidebar } from "./useSidebar";
import { radius, shadow, transition } from "../../tokens/designTokens";
import { SidebarNavGroup } from "./SidebarNavGroup";
import { SidebarNavItem } from "./SidebarNavItem";
import { sidebarConfig } from "./sidebarConfig";

export const Sidebar: React.FC = () => {
  const { isCollapsed, toggle } = useSidebar();

  return (
    <aside
      className={clsx(
        "h-screen flex flex-col bg-white border-r border-gray-200 text-gray-800",
        shadow.sm,
        transition.base,
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          "flex items-center justify-between p-4 border-b border-gray-100",
          transition.base
        )}
      >
        {!isCollapsed && (
          <span className="text-lg font-semibold tracking-tight">
            BackTrack
          </span>
        )}
        <button
          onClick={toggle}
          className={clsx(
            "text-gray-500 hover:text-gray-800 p-1 rounded",
            radius.sm,
            transition.base
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto mt-2">
        {sidebarConfig.map((item) =>
          item.children ? (
            <SidebarNavGroup key={item.label} label={item.label}>
              {item.children.map((child) => (
                <SidebarNavItem
                  key={child.label}
                  label={child.label}
                  icon={child.icon}
                />
              ))}
            </SidebarNavGroup>
          ) : (
            <SidebarNavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
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
