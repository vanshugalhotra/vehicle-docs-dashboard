"use client";

import React, { FC, ReactNode } from "react";
import { componentTokens } from "@/styles/design-system";
import { SidebarProvider } from "@/lib/providers/SidebarProvider";
import { Sidebar } from "../sidebar/Sidebar";
import { Topbar, TopbarActionItem } from "../topbar";
import { PageWrapper } from "../pagewrapper";

interface AppLayoutProps {
  title?: string;
  children: ReactNode;
  topbarActions?: TopbarActionItem[];
  showTopbarShadow?: boolean;
}

export const AppLayout: FC<AppLayoutProps> = ({
  title,
  children,
  topbarActions,
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
            actions={topbarActions}
            showShadow={showTopbarShadow}
          />

          {/* Page Content */}
          <PageWrapper>{children}</PageWrapper>
        </div>
      </div>
    </SidebarProvider>
  );
};