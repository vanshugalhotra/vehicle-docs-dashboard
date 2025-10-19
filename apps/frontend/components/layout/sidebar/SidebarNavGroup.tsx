"use client";
import React, { FC, ReactNode, useState, useEffect } from "react";
import clsx from "clsx";
import { useSidebar } from "./useSidebar";
import { radius } from "../../tokens/designTokens";
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
      className={clsx(
        "flex items-center gap-2 justify-between w-full px-4 py-2 text-left rounded transition-colors duration-200 hover:bg-gray-100",
        radius.sm
      )}
    >
      {!isCollapsed && (
        <span className="font-semibold flex items-center gap-2">
          {icon && <span className="text-gray-600">{icon}</span>}
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
