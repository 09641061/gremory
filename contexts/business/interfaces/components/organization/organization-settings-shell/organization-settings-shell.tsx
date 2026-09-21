import type { ReactNode } from "react";

import { OrganizationSettingsSidebar } from "@/contexts/business/interfaces/components/organization/organization-settings-sidebar/organization-settings-sidebar";
import { SidebarProvider } from "@/contexts/shared/interfaces/components/ui/sidebar";

/**
 * Visual shell for every "Organization settings" hub screen.
 *
 * Owns the two-column chrome (left sidebar + right content) that
 * `app/(protected)/(configuration)/(organization-hub)/organization/` and
 * `app/(protected)/(configuration)/(organization-hub)/establishments/` both
 * rely on. Extracted
 * so adding a new section to the hub is a one-line `layout.tsx` change
 * instead of another copy of the same Tailwind/SidebarProvider wiring.
 *
 * Purely presentational: no auth/redirect logic, no async work. The parent
 * `(configuration)` layout still owns the entry-guard, the back-to-home
 * arrow, and the page padding. This shell only reserves the left column for
 * the sidebar and gives the page content the remaining reading width.
 *
 * Wraps the sidebar in its own `SidebarProvider` because the shadcn
 * `Sidebar*` primitives call `useSidebar` internally. We don't read `open`
 * here because this sidebar is always visible — there's no off-canvas
 * collapse on a configuration hub.
 */
export function OrganizationSettingsShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-1 flex-col gap-6 lg:flex-row">
      <SidebarProvider className="w-full lg:w-60">
        <aside className="w-full shrink-0">
          <OrganizationSettingsSidebar />
        </aside>
      </SidebarProvider>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
