"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Store,
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
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import {
  type OrganizationSettingsHref,
  resolveOrganizationSettingsAccess,
} from "@/contexts/business/application/services/organization-settings-navigation";

/**
 * Navigation for the Organization settings hub.
 *
 * Reuses the shadcn `Sidebar*` primitives so it stays visually consistent with
 * the main app sidebar. Lives inside the
 * `app/(protected)/(configuration)/(organization-hub)/` route group, so it
 * scopes itself to the Organization settings hub (Organization + Members +
 * Invites + Establishments) and never bleeds into sibling
 * configuration pages (`/profile`, `/permissions`, the legacy
 * `/organizations` redirect).
 *
 * The owner sees the complete hub. Collaborators only see the sections granted
 * by their role, so navigation never advertises a route they cannot open.
 */
export function OrganizationSettingsSidebar({ workspace }: { workspace: WorkspaceHeaderViewModel }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const access = resolveOrganizationSettingsAccess(workspace);

  const entries: ReadonlyArray<{
    href: OrganizationSettingsHref;
    label: string;
    icon: LucideIcon;
    visible: boolean;
  }> = [
    {
      href: "/organization",
      label: t.organizationSettings.organization,
      icon: Building2,
      visible: access.organization,
    },
    {
      href: "/organization/members",
      label: t.organizationSettings.members,
      icon: Users,
      visible: access.members,
    },
    {
      href: "/organization/roles",
      label: "Roles y permisos",
      icon: ShieldCheck,
      visible: access.roles,
    },
    {
      href: "/organization/invites",
      label: t.organizationSettings.invites,
      icon: UserPlus,
      visible: access.invites,
    },
    {
      href: "/establishments",
      label: t.organizationSettings.establishments,
      icon: Store,
      visible: access.establishments,
    },
  ];

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupContent className="shrink-0">
        <SidebarMenu className="gap-(--app-sidebar-menu-gap)">
          {entries.filter((entry) => entry.visible).map(({ href, label, icon: Icon }) => {
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
