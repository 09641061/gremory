"use client";

import React from "react";
import { Sidebar } from "@/contexts/shared/interfaces/components/sidebar";

/**
 * Main dashboard layout wrapper rendering the responsive Sidebar and main content canvas.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 p-6 lg:ml-60">{children}</main>
    </div>
  );
}
