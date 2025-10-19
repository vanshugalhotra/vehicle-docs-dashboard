"use client";
import React, { FC, ReactNode, useState, useEffect } from "react";
import clsx from "clsx";
import { useSidebar } from "./useSidebar";
import { radius, theme } from "../../tokens/designTokens";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppTooltip } from "@/components/ui/AppTooltip";

export interface SidebarNavItemProps {
  label: string;
  icon: ReactNode;
  path?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export const SidebarNavItem: FC<SidebarNavItemProps> = ({
  label,
  icon,
  path,
  children,
  onClick,
}) => {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = theme.light;

  const hasChildren = !!children;
  const isActive = path ? pathname === path : false;

  useEffect(() => {
    if (hasChildren) {
      const hasActiveChild = React.Children.toArray(children).some((child) => {
        if (!React.isValidElement(child)) return false;
        const childElement = child as React.ReactElement<{ path?: string }>;
        return childElement.props?.path === pathname;
      });
      if (hasActiveChild) setOpen(true);
    }
  }, [pathname, children, hasChildren]);

  const handleToggle = () => {
    if (hasChildren) setOpen((prev) => !prev);
    if (onClick) onClick();
  };

  const content = (
    <button
      onClick={handleToggle}
      className={clsx(
        "flex items-center gap-3 w-full px-4 py-2 text-left rounded transition-colors duration-200",
        radius.sm,
        isActive
          ? clsx("bg-blue-100 text-blue-700 font-semibold")
          : "text-gray-700 hover:bg-gray-100",
        open && !isActive ? "bg-gray-50" : ""
      )}
    >
      <span className={clsx("text-gray-600", isActive && t.colors.primary)}>
        {icon}
      </span>
      {!isCollapsed && <span className="flex-1">{label}</span>}
      {!isCollapsed && hasChildren && (
        <ChevronDown
          size={16}
          className={clsx(
            "transition-transform duration-200",
            open ? "rotate-180" : "rotate-0"
          )}
        />
      )}
    </button>
  );

  return (
    <div>
      {isCollapsed ? (
        <AppTooltip content={label}>{content}</AppTooltip>
      ) : (
        content
      )}
      {hasChildren && open && !isCollapsed && (
        <div className="ml-6 mt-1 flex flex-col gap-1">{children}</div>
      )}
    </div>
  );
};
