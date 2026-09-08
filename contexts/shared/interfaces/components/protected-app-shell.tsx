import type { CSSProperties, ReactNode } from "react";
import { Suspense } from "react";
import { AppHeaderServer } from "./header/app-header-server";
import { AppHeaderFallback } from "./header/app-header-fallback";
import { AppShellSidebarServer } from "./sidebar/app-sidebar-shell-server";
import { AppSidebarFallback } from "./sidebar/app-sidebar-fallback";
import { PageLoading } from "./page-loading";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "./ui/sidebar";

export default function ProtectedAppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<AppHeaderFallback />}>
        <AppHeaderServer />
      </Suspense>
      <SidebarProvider
        className="bg-background text-foreground"
        style={{ "--app-page-viewport-height": "calc(100vh - 10.5rem)" } as CSSProperties}
      >
        <Suspense fallback={<AppSidebarFallback />}>
          <AppShellSidebarServer />
        </Suspense>
        <SidebarInset>
          <SidebarTrigger className="mb-4 md:hidden" />
          <Suspense fallback={<PageLoading />}>{children}</Suspense>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
