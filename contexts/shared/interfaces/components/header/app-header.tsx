"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import { SidebarProfile } from "@/contexts/profiles/interfaces/components/profile/sidebar-profile";
import { NotificationDropdown } from "@/contexts/notifications/interfaces/components/notification-dropdown";
import { NotificationsProvider } from "@/contexts/notifications/interfaces/components/hooks/use-notifications";

/**
 * Canonical landing route for an unauthenticated / shell-unavailable user.
 * Must stay in sync with the unauthenticated fallback in `app-header-server.tsx`
 * and the request proxy.
 */
export const APP_HEADER_FALLBACK_HOME_HREF = "/welcome";

export function AppHeader({
  profile,
  workspace,
  homeHref,
}: {
  profile: Pick<ProfileViewModel, "username" | "imageUrl"> | null;
  workspace: WorkspaceHeaderViewModel | null;
  /**
   * Server-resolved landing destination derived from the entry-route policy
   * (subscription state + access policy + account type). When omitted, the
   * link falls back to the canonical welcome route.
   */
  homeHref?: string | null;
}) {
  const pathname = usePathname();
  const requestedEstablishmentId = useSearchParams().get("establishmentId");
  const establishmentId = requestedEstablishmentId && workspace?.establishments.some((item) => item.id === requestedEstablishmentId)
    ? requestedEstablishmentId : workspace?.activeEstablishmentId;
  const isAccountStateRoute = ["/welcome", "/organizations/new", "/invitations/pending", "/access-denied", "/no-access"].includes(pathname);
  const canManageBilling = isAccountStateRoute || workspace?.accessPolicy?.canManageBilling === true;

  const resolvedHomeHref = homeHref ?? APP_HEADER_FALLBACK_HOME_HREF;
  const isHomeActive = pathname === resolvedHomeHref;

  return (
    // The notifications provider centralises unread-count polling and the
    // cached notifications page. Wrapping the header here means a single
    // provider instance exists per AppHeader render — the dropdown inside it
    // (and any future notification consumers) all share the same polling
    // cadence and cached state.
    <NotificationsProvider>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background px-4 sm:px-6">
        <Link
          href={resolvedHomeHref}
          aria-label="Takodu — go to home"
          aria-current={isHomeActive ? "page" : undefined}
          data-testid="app-header-brand-link"
          className="-mx-2 rounded-md px-2 py-1 text-sm font-semibold tracking-tight text-foreground transition-colors hover:bg-accent/70 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Takodu
        </Link>

        <div className="flex min-w-0 items-center gap-3">
          <NotificationDropdown variant="compact" />
          <SidebarProfile
            profile={profile}
            profileHref="/profile"
            canManageBilling={canManageBilling}
            invoiceHref={establishmentId ? `/invoice?establishmentId=${establishmentId}` : "/invoice"}
            active={pathname === "/profile" || pathname.startsWith("/profile/") || pathname === "/invoice" || pathname.startsWith("/invoice/")}
          />
        </div>
      </header>
    </NotificationsProvider>
  );
}