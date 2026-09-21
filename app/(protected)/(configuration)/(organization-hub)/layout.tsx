import type { ReactNode } from "react";

import { OrganizationSettingsShell } from "@/contexts/business/interfaces/components/organization/organization-settings-shell/organization-settings-shell";

/**
 * Shared layout for every "Organization settings" hub screen
 * (`/organization/*` and `/establishments/*`).
 *
 * Sits inside `(configuration)` so the parent layout still owns the
 * authentication/onboarding guard and the "back to home" arrow above it. This
 * layout only attaches the shared {@link OrganizationSettingsShell} that
 * renders the left-hand sidebar plus the content column.
 *
 * Why this lives at a route group above `/organization` and `/establishments`
 * instead of inside either of them: when navigating between the two, Next.js
 * preserves a layout only if the route segment above it is unchanged. By
 * hoisting the sidebar shell to a common ancestor (this route group), the
 * sidebar stays mounted across navigations like `/organization` →
 * `/establishments`, `/organization/members` → `/organization/roles`, etc.
 * Otherwise the sidebar would unmount and remount on every cross-section
 * click, recreating the `SidebarProvider` and any internal sidebar state.
 *
 * The route group `(organization-hub)` does not contribute to the URL: the
 * routes themselves remain `/organization` and `/establishments`. Sibling
 * configuration pages outside this group (`/profile`, `/permissions`, the
 * legacy `/organizations` redirect) intentionally do not see the sidebar.
 */
export default function OrganizationHubLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <OrganizationSettingsShell>{children}</OrganizationSettingsShell>;
}
