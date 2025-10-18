"use client";
import React, { FC, ReactNode, useState, useEffect } from "react";
import clsx from "clsx";
import { useSidebar } from "./useSidebar";
import { radius, transition } from "../../tokens/designTokens";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

export interface SidebarNavGroupProps {
  label: string;
  children: ReactNode;
  initiallyOpen?: boolean;
}

export const SidebarNavGroup: FC<SidebarNavGroupProps> = ({
  label,
  children,
  initiallyOpen = false,
}) => {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const [open, setOpen] = useState(initiallyOpen);

  useEffect(() => {
    const childArray = React.Children.toArray(children);
    const hasActiveChild = childArray.some((child) => {
      if (React.isValidElement(child)) {
        const props = child.props as { path?: string | undefined };
        return props.path === pathname;
      }
      return false;
    });

    if (hasActiveChild) {
      setOpen(true);
    }
  }, [pathname, children]);

  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <div className="flex flex-col">
      {/* Group Header */}
      <button
        onClick={toggleOpen}
        className={clsx(
          "flex items-center justify-between w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100",
          radius.sm,
          transition.base
        )}
      >
        {!isCollapsed && <span className="font-semibold">{label}</span>}
        {!isCollapsed && (
          <ChevronDown
            size={16}
            className={clsx("transition-transform", open ? "rotate-180" : "rotate-0")}
          />
        )}
      </button>

      {/* Group Items */}
      {!isCollapsed && open && (
        <div className="flex flex-col ml-4 mt-1 gap-1">{children}</div>
      )}
    </div>
  );
};
