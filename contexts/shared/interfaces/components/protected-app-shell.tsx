import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppHeaderServer } from "./header/app-header-server";
import { AppHeaderFallback } from "./header/app-header-fallback";
import { AppShellSidebarServer } from "./sidebar/app-sidebar-shell-server";
import { AppSidebarFallback } from "./sidebar/app-sidebar-fallback";
import { PageLoading } from "./page-loading";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "./ui/sidebar";

export default function ProtectedAppShell({ children }: { children: ReactNode }) {
  // The flex column owns the viewport (`min-h-svh`) so the sticky header above
  // and the sidebar provider below share exactly one viewport's height.
  // The provider itself no longer carries `min-h-svh` (see `ui/sidebar.tsx`),
  // so it grows with `flex-1` to fill whatever the column leaves behind the
  // 64px header. That keeps the page total = 100svh and removes the redundant
  // body scroll that appeared when the header was moved outside the provider.
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Suspense fallback={<AppHeaderFallback />}>
        <AppHeaderServer />
      </Suspense>
      <SidebarProvider className="flex-1 bg-background text-foreground">
        <Suspense fallback={<AppSidebarFallback />}>
          <AppShellSidebarServer />
        </Suspense>
        <SidebarInset>
          <SidebarTrigger className="mb-4 md:hidden" />
          <Suspense fallback={<PageLoading />}>{children}</Suspense>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
