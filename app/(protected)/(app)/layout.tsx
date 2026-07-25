import type { ReactNode } from "react";
import { Sidebar } from "@/contexts/shared/interfaces/components/sidebar";

/**
 * Main app layout wrapper rendering the responsive Sidebar and main content canvas.
 */
export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 p-6 pt-16 lg:ml-60">{children}</main>
    </>
  );
}
