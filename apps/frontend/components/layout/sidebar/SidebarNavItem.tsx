"use client";
import React, { FC, ReactNode, useState, useEffect } from "react";
import clsx from "clsx";
import { useSidebar } from "./useSidebar";
import { componentTokens } from "@/styles/design-system";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppTooltip } from "@/components/ui/AppTooltip";
import Link from "next/link";

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

  const innerContent = (
    <div
      className={clsx(
        componentTokens.sidebar.item,
        isActive && componentTokens.sidebar.itemActive,
        !isActive && componentTokens.sidebar.itemHover,
        open && !isActive && componentTokens.sidebar.itemOpen,
        "group" // New: For group-hover effects
      )}
      aria-expanded={open}
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
      {!isCollapsed && <span className={componentTokens.sidebar.label}>{label}</span>}
      {!isCollapsed && hasChildren && (
        <ChevronDown className={componentTokens.sidebar.chevron} />
      )}
    </div>
  );

  const content = path ? (
    <Link
      href={path}
      className="block w-full" // New: Full-width link wrapper
      onClick={onClick} // Preserve onClick if needed
    >
      {innerContent}
    </Link>
  ) : (
    <button onClick={handleToggle} className="w-full">
      {innerContent}
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
        <div className={componentTokens.sidebar.childrenIndent}>{children}</div>
      )}
    </div>
  );
};