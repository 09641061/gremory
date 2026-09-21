import type { ReactNode } from "react";

import { OrganizationSettingsSidebar } from "@/contexts/business/interfaces/components/organization/organization-settings-sidebar/organization-settings-sidebar";
import { SidebarProvider } from "@/contexts/shared/interfaces/components/ui/sidebar";

/**
 * Hub layout for the Organization settings sections.
 *
 * Sits under `(configuration)`, so the parent layout still owns the
 * authentication/onboarding guard and the "back to home" arrow above it. This
 * layout only adds a left-hand sidebar that links the four sections of the
 * hub (Organization settings, Members, Roles, Invites).
 *
 * Wraps the sidebar in its own `SidebarProvider` because the shadcn
 * `Sidebar*` primitives (`SidebarGroup`, `SidebarMenuButton`, etc.) call
 * `useSidebar` internally. The provider only needs to exist for the context;
 * we don't read its `open` state here because this sidebar is always visible
 * — there's no off-canvas collapse on a configuration hub.
 *
 * Purely presentational: no cookies, no async work, no `Suspense`. Reserving
 * the right column for the actual page content keeps the existing
 * `OrganizationSettingsCard` and the new shells at a comfortable reading width
 * without competing with the parent layout's padding.
 */
export default function OrganizationSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
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