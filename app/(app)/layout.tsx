"use client";

import React from "react";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { Sidebar } from "@/contexts/shared/interfaces/components/sidebar";

/**
 * Main app layout wrapper rendering the responsive Sidebar and main content canvas.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <Header />
      <main className="flex-1 p-6 pt-16 lg:ml-60">{children}</main>
    </div>
  );
}
