// components/layout/useSidebar.ts
import { useContext, Context } from "react";
import { SidebarContextState } from "./types";
import { __unsafe_getSidebarContext } from "./SidebarProvider";

/**
 * useSidebar
 * - Hook to access sidebar state/actions
 * - Throws clearly if used outside SidebarProvider (helps debugging)
 */
export const useSidebar = (): SidebarContextState => {
  const ctx = useContext(__unsafe_getSidebarContext() as Context<SidebarContextState | undefined>);
  if (ctx === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx as SidebarContextState;
};
