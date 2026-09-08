import type { CSSProperties, ReactNode } from "react";
import { Suspense } from "react";
import { AppHeaderServer } from "./app-header-server";
import { AppShellSidebarServer } from "./app-shell-sidebar-server";
import { AppSidebarFallback } from "./app-sidebar-fallback";
import { PageLoading } from "./page-loading";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

export default function ProtectedAppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      className="flex-col bg-background text-foreground"
      style={{ "--app-page-viewport-height": "calc(100vh - 10.5rem)" } as CSSProperties}
    >
      <Suspense fallback={<div className="h-16 shrink-0" />}>
        <AppHeaderServer />
      </Suspense>
      <div className="flex min-w-0 flex-1">
        <Suspense fallback={<AppSidebarFallback />}>
          <AppShellSidebarServer />
        </Suspense>
        <main className="flex min-w-0 flex-1 flex-col p-6">
          <SidebarTrigger className="mb-4 md:hidden" />
          <Suspense fallback={<PageLoading />}>{children}</Suspense>
        </main>
      </div>
    </SidebarProvider>
  );
}
