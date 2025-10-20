"use client";
import React, { FC, ReactNode, useState, useEffect } from "react";
import clsx from "clsx";
import { useSidebar } from "./useSidebar";
import { componentTokens } from "@/styles/design-system";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppTooltip } from "@/components/ui/AppTooltip";

export interface SidebarNavGroupProps {
  label: string;
  children: ReactNode;
  icon?: ReactNode;
  initiallyOpen?: boolean;
}

export const SidebarNavGroup: FC<SidebarNavGroupProps> = ({
  label,
  children,
  icon,
  initiallyOpen = false,
}) => {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const [open, setOpen] = useState(initiallyOpen);

  useEffect(() => {
    const childArray = React.Children.toArray(children);
    const hasActiveChild = childArray.some((child) => {
      if (React.isValidElement(child)) {
        const props = child.props as { path?: string };
        return props.path === pathname;
      }
      return false;
    });
    if (hasActiveChild) setOpen(true);
  }, [pathname, children]);

  const toggleOpen = () => setOpen((prev) => !prev);

  const content = (
    <button
      onClick={toggleOpen}
      className={componentTokens.sidebar.group}
    >
      {!isCollapsed && (
        <span className={componentTokens.sidebar.groupLabel}>
          {icon && <span className={componentTokens.sidebar.icon}>{icon}</span>}
          {label}
        </span>
      )}
      {!isCollapsed && (
        <ChevronDown
          size={16}
          className={clsx("transition-transform duration-200", open ? "rotate-180" : "rotate-0")}
        />
      )}
    </button>
  );

  return (
    <div className="flex flex-col">
      {isCollapsed ? <AppTooltip content={label}>{content}</AppTooltip> : content}
      {!isCollapsed && open && <div className="flex flex-col ml-4 mt-1 gap-1">{children}</div>}
    </div>
  );
};