"use client";
import React, { FC, ReactNode, useState, useEffect } from "react";
import { useSidebar } from "@/hooks/useSidebar";
import { componentTokens } from "@/styles/design-system";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppTooltip } from "@/components/ui/AppTooltip";
import { AppText } from "@/components/ui/AppText";

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
      aria-expanded={open}
    >
      {!isCollapsed && (
        <span className={componentTokens.sidebar.groupLabel}>
          {icon && <span className={componentTokens.sidebar.icon}>{icon}</span>}
          <AppText size="body" className="font-semibold">{label}</AppText>
        </span>
      )}
      {!isCollapsed && (
        <ChevronDown className={componentTokens.sidebar.chevron} />
      )}
    </button>
  );

  return (
    <div className="flex flex-col">
      {isCollapsed ? <AppTooltip content={label}>{content}</AppTooltip> : content}
      {!isCollapsed && open && <div className={componentTokens.sidebar.childrenIndent}>{children}</div>}
    </div>
  );
};