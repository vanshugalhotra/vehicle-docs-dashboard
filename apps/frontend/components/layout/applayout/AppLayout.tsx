"use client";

import React, { FC, ReactNode } from "react";
import { componentTokens } from "@/styles/design-system";
import { SidebarProvider } from "@/lib/providers/SidebarProvider";
import { Sidebar } from "../sidebar/Sidebar";
import { Topbar } from "../topbar";
import { PageWrapper } from "../pagewrapper";

interface AppLayoutProps {
  title?: string;
  children: ReactNode;
  /** Custom actions to render on the right side of the Topbar */
  rightActions?: ReactNode;
  showTopbarShadow?: boolean;
}

export const AppLayout: FC<AppLayoutProps> = ({
  title,
  children,
  rightActions,
  showTopbarShadow = true,
}) => {
  return (
    <SidebarProvider>
      <div className={componentTokens.layout.app}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className={componentTokens.layout.main}>
          {/* Topbar */}
          <Topbar
            title={title}
            rightActions={rightActions}
            showShadow={showTopbarShadow}
          />

          {/* Page Content */}
          <PageWrapper>{children}</PageWrapper>
        </div>
      </div>
    </SidebarProvider>
  );
};
