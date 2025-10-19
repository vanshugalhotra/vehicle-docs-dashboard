"use client";

import React, { ReactNode } from "react";
import { SidebarProvider } from "../sidebar/SidebarProvider";
import { Sidebar } from "../sidebar";
import { Topbar, TopbarActionItem } from "../topbar";
import { PageWrapper } from "../pagewrapper";

interface AppLayoutProps {
  title?: string;
  children: ReactNode;
  topbarActions?: TopbarActionItem[];
  showTopbarShadow?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  title,
  children,
  topbarActions,
  showTopbarShadow = true,
}) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-auto">
          <Topbar
            title={title}
            actions={topbarActions}
            showShadow={showTopbarShadow}
          />

          <PageWrapper>{children}</PageWrapper>
        </div>
      </div>
    </SidebarProvider>
  );
};
