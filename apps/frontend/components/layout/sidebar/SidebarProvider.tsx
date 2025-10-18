// components/layout/SidebarProvider.tsx
import React, { createContext, FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { SidebarContextState, SidebarSize } from "./types";

const STORAGE_KEY = "app:sidebarSize";

/**
 * SidebarProvider
 * - Manages sidebar size state (expanded / collapsed)
 * - Persists preference to localStorage (optional)
 * - SSR-safe: doesn't access window/localStorage on server
 */
interface Props {
  children: ReactNode;
  /**
   * If true, persist the sidebar size to localStorage.
   * Default: true
   */
  persist?: boolean;
  /**
   * Initial size to use (server-side / first render)
   * Default: 'expanded'
   */
  initialSize?: SidebarSize;
}

const SidebarContext = createContext<SidebarContextState | undefined>(undefined);

export const SidebarProvider: FC<Props> = ({ children, persist = true, initialSize = "expanded" }) => {
  // Start with initialSize to be SSR-safe; on mount, try to read persisted value
  const [size, setSize] = useState<SidebarSize>(initialSize);

  useEffect(() => {
    if (!persist) return;
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw === "collapsed" || raw === "expanded") {
        setSize(raw);
      }
    } catch {
      // ignore localStorage errors (private mode, etc.)
      /* noop */
    }
    // we intentionally run this once on mount
  }, [persist]);

  const persistSize = useCallback(
    (s: SidebarSize) => {
      if (!persist) return;
      try {
        if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, s);
      } catch {
        // ignore
      }
    },
    [persist]
  );

  const collapse = useCallback(() => {
    setSize("collapsed");
    persistSize("collapsed");
  }, [persistSize]);

  const expand = useCallback(() => {
    setSize("expanded");
    persistSize("expanded");
  }, [persistSize]);

  const toggle = useCallback(() => {
    setSize((prev) => {
      const next = prev === "expanded" ? "collapsed" : "expanded";
      persistSize(next);
      return next;
    });
  }, [persistSize]);

  const isCollapsed = size === "collapsed";

  const value = useMemo<SidebarContextState>(() => {
    return {
      size,
      isCollapsed,
      collapse,
      expand,
      toggle,
      setSize,
    };
  }, [size, isCollapsed, collapse, expand, toggle]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

/**
 * Internal helper to access context (used by the hook)
 */
export const __unsafe_getSidebarContext = () => SidebarContext;
