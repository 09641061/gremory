import type { ReactNode } from "react";
import { Suspense } from "react";

import { AppHeaderServer } from "./header/app-header-server";
import { AppHeaderFallback } from "./header/app-header-fallback";
import { AppShellSidebarServer } from "./sidebar/app-sidebar-shell-server";
import { AppSidebarFallback } from "./sidebar/app-sidebar-fallback";
import { PageLoading } from "./page-loading";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "./ui/sidebar";

import { PushNotificationRegisterServer } from "@/contexts/notifications/interfaces/components/push-notification-register-server";

/**
 * Route shell for all authenticated routes (app, onboarding, status, welcome).
 *
 * Layout chain (top to bottom):
 *   body (min-h-svh from globals.css)
 *   <div flex min-h-svh flex-col>          - viewport owner
 *     header (sticky top-0 h-16)           - 64px, AppHeaderServer
 *     SidebarProvider (flex-1)             - fills the remaining column
 *       AppShellSidebarServer
 *       SidebarInset (main, flex flex-1 flex-col)
 *         SidebarTrigger (md:hidden)
 *         Suspense {children}
 *     <Suspense fallback={null}>            - background side-effect
 *       PushNotificationRegisterServer     - does not render visible UI
 *
 * The <div flex min-h-svh flex-col> wrapper is load-bearing: it owns the viewport so
 * the sticky header and the sidebar provider share exactly one viewport height. Do
 * NOT replace `min-h-0 flex-1` on the provider with a viewport-derived calc.
 */
export default function ProtectedAppShell({ children }: { children: ReactNode }) {
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
          {/*
            Safety-net Suspense: each page is expected to wrap its own dynamic
            reads, but if a sibling forgets, this boundary keeps the navigation
            instant under Cache Components.
          */}
          <Suspense fallback={<PageLoading />}>{children}</Suspense>
        </SidebarInset>
      </SidebarProvider>

      {/*
        Push-notification registration is a global side effect. It renders no
        visible UI, so a null fallback keeps the route shell layout untouched.
        Placed as the last flex-column child so it cannot displace header or
        sidebar height.
      */}
      <Suspense fallback={null}>
        <PushNotificationRegisterServer />
      </Suspense>
    </div>
  );
}
