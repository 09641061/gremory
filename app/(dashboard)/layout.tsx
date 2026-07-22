import React from "react";
import { Sidebar } from "@/contexts/shared/interfaces/components/navigation";

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
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Canvas with left margin offset for desktop */}
      <main className="flex-1 lg:ml-64 p-6 transition-all duration-200">
        {children}
      </main>
    </div>
  );
}
