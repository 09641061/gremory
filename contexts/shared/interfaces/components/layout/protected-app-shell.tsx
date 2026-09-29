import type { ReactNode } from "react";
import { Suspense } from "react";

import { AppShellSidebarServer } from "../sidebar/app-sidebar-shell-server";
import { AppSidebarFallback } from "../sidebar/app-sidebar-fallback";
import { PageLoading } from "../feedback/page-loading";
import { SidebarProvider, SidebarInset } from "../ui/sidebar";

import { PushNotificationRegisterServer } from "@/contexts/notifications/interfaces/components/push-notification-register-server";

/**
 * Route shell for all authenticated routes (app, onboarding, status, welcome).
 *
 * Layout chain:
 *   SidebarProvider (the only chrome — owns the full viewport)
 *     AppShellSidebarServer   ← brand, workspace, nav, assistant, notifications, profile
 *     SidebarInset (main, scrollable) ← page content
 *   <Suspense fallback={null}>
 *     PushNotificationRegisterServer   ← non-visual side effect
 *
 * The header that previously sat above the sidebar is gone: the brand, bell
 * and profile now live inside the sidebar itself, so the route owns one shell
 * instead of two. The viewport still resolves to 100svh because the parent
 * layout chain already provides `min-h-svh` (see `app/(protected)/layout.tsx`
 * and `app/globals.css`).
 *
 * The sidebar streams behind its own Suspense boundary so resolving the
 * workspace never delays the page underneath it. The page itself is wrapped
 * in a second Suspense as a safety net for dynamic reads siblings may forget
 * to guard.
 */
export default function ProtectedAppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SidebarProvider className="flex min-h-0 flex-1 bg-background text-foreground">
        <Suspense fallback={<AppSidebarFallback />}>
          <AppShellSidebarServer />
        </Suspense>
        <SidebarInset className="min-h-0 flex-1 overflow-y-auto">
          <span id="app-main-content" tabIndex={-1} className="sr-only" />
          <Suspense fallback={<PageLoading />}>{children}</Suspense>
        </SidebarInset>
      </SidebarProvider>

      {/*
        Push-notification registration is a global side effect. It renders no
        visible UI, so a null fallback keeps the route shell layout untouched.
        Placed outside the SidebarProvider so it cannot displace sidebar height.
      */}
      <Suspense fallback={null}>
        <PushNotificationRegisterServer />
      </Suspense>
    </>
  );
}
