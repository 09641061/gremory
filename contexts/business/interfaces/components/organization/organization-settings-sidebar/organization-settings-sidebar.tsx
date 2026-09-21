"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/contexts/shared/interfaces/components/ui/sidebar";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

type OrganizationSettingsHref =
  | "/organization"
  | "/organization/members"
  | "/organization/roles"
  | "/organization/invites";

/**
 * Navigation for the Organization settings hub.
 *
 * Reuses the shadcn `Sidebar*` primitives so it stays visually consistent with
 * the main app sidebar. Lives only inside the
 * `app/(protected)/(configuration)/organization/` layout, so it never bleeds
 * into other configuration pages (e.g. `/establishments`, `/permissions`).
 *
 * Entries are hardcoded — no permission filtering for now because every owner
 * who reaches `/organization` is expected to manage the four sections. Add
 * filtering here if/when granular per-section permissions are introduced.
 */
export function OrganizationSettingsSidebar() {
  const { t } = useI18n();
  const pathname = usePathname();

  const entries: ReadonlyArray<{
    href: OrganizationSettingsHref;
    label: string;
    icon: LucideIcon;
  }> = [
    {
      href: "/organization",
      label: t.organizationSettings.organization,
      icon: Building2,
    },
    {
      href: "/organization/members",
      label: t.organizationSettings.members,
      icon: Users,
    },
    {
      href: "/organization/roles",
      label: t.organizationSettings.roles,
      icon: ShieldCheck,
    },
    {
      href: "/organization/invites",
      label: t.organizationSettings.invites,
      icon: UserPlus,
    },
  ];

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupContent className="shrink-0">
        <SidebarMenu className="gap-(--app-sidebar-menu-gap)">
          {entries.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  render={<Link href={href} aria-current={active ? "page" : undefined} />}
                  isActive={active}
                  size="default"
                  tooltip={label}
                  className="h-(--app-sidebar-control-height)"
                >
                  <Icon strokeWidth={2} />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}