import { ReactNode } from "react";

export type SidebarSize = "expanded" | "collapsed";

export interface SidebarContextState {
  size: SidebarSize;
  isCollapsed: boolean;
  collapse: () => void;
  expand: () => void;
  toggle: () => void;
  setSize: (s: SidebarSize) => void;
}

export interface SidebarItemConfig {
  type?: "brand"; // optional, used for brand/title
  label: string;
  icon?: ReactNode;
  path?: string;
  children?: SidebarItemConfig[];
}
