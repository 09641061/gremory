"use client";

import React from "react";
import { Sidebar, SidebarProvider, useSidebar } from "@/contexts/shared/interfaces/components/navigation";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={cn(
        "flex-1 p-6 transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}
    >
      {children}
    </main>
  );
}

/**
 * Main dashboard layout wrapper rendering the responsive Sidebar and main content canvas.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Canvas with dynamic left margin offset */}
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}
