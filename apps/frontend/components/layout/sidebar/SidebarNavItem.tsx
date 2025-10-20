"use client";
import React, { FC, ReactNode, useState, useEffect } from "react";
import clsx from "clsx";
import { useSidebar } from "./useSidebar";
import { componentTokens } from "@/styles/design-system";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppTooltip } from "@/components/ui/AppTooltip";
import { AppText } from "@/components/ui/AppText";

export interface SidebarNavItemProps {
  label: string;
  icon?: ReactNode;
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
        componentTokens.sidebar.item,
        isActive && componentTokens.sidebar.itemActive,
        !isActive && componentTokens.sidebar.itemHover,
        open && !isActive && componentTokens.sidebar.itemOpen
      )}
    >
      {icon && (
        <span
          className={clsx(
            componentTokens.sidebar.icon,
            isActive && "text-primary"
          )}
        >
          {icon}
        </span>
      )}
      {!isCollapsed && <AppText size="label">{label}</AppText>}
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
