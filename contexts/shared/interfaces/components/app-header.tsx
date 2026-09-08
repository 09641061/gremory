"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import { SidebarProfile } from "@/contexts/profiles/interfaces/components/profile/sidebar-profile";
import { NotificationDropdown } from "@/contexts/notifications/interfaces/components/notification-dropdown";
import { LocaleSync } from "@/contexts/shared/interfaces/i18n";

export function AppHeader({ profile, workspace }: {
  profile: (Pick<ProfileViewModel, "username" | "imageUrl"> & { language?: "ES" | "EN" }) | null;
  workspace: WorkspaceHeaderViewModel | null;
}) {
  const pathname = usePathname();
  const requestedEstablishmentId = useSearchParams().get("establishmentId");
  const establishmentId = requestedEstablishmentId && workspace?.establishments.some((item) => item.id === requestedEstablishmentId)
    ? requestedEstablishmentId : workspace?.activeEstablishmentId;
  const isAccountStateRoute = ["/welcome", "/organizations/new", "/invitations/pending", "/access-denied", "/no-access"].includes(pathname);
  const canManageBilling = isAccountStateRoute || workspace?.accessPolicy?.canManageBilling === true;
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-end border-b border-border/60 bg-background px-4 sm:px-6">
      <LocaleSync profileLanguage={profile?.language} />
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
  );
}
