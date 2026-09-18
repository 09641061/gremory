"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Mail, Plus, Shield, Store, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  OrganizationDetailCard,
  type OrganizationSection,
} from "./organization-detail-card";
import type { WorkspaceNavigationOrganizationGroup } from "@/contexts/business/domain/services/workspace-navigation.policy";

export type OrganizationListItem = WorkspaceNavigationOrganizationGroup;

const sections: ReadonlyArray<{
  id: OrganizationSection;
  label: string;
  icon: typeof Building2;
}> = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "establishments", label: "Establishments", icon: Store },
  { id: "members", label: "Members", icon: Users },
  { id: "invites", label: "Invites", icon: Mail },
  { id: "roles", label: "Roles", icon: Shield },
];

/**
 * Unified settings layout: an internal vertical navigation sidebar on the left and the
 * section content on the right. The previously separate organization search/list column
 * is gone; the selected organization is derived from the workspace context and the
 * sidebar drives which settings panel renders.
 */
export function OrganizationsPage({
  organizations,
  ownedOrganizationId,
  activeOrganizationId,
  initialPreviewOrganizationId = null,
  canCreateOrganization = false,
}: {
  organizations: ReadonlyArray<OrganizationListItem>;
  ownedOrganizationId: string | null;
  activeOrganizationId: string | null;
  initialPreviewOrganizationId?: string | null;
  canCreateOrganization?: boolean;
}) {
  const [activeSection, setActiveSection] = useState<OrganizationSection>("organization");

  const selectedOrganization =
    organizations.find((org) => org.organizationId === initialPreviewOrganizationId) ??
    organizations.find((org) => org.organizationId === activeOrganizationId) ??
    organizations.find((org) => org.organizationId === ownedOrganizationId) ??
    organizations[0] ??
    null;

  return (
    <section className="mx-auto grid w-full max-w-[110rem] gap-6 lg:grid-cols-[minmax(0,20%)_minmax(0,80%)]">
      <aside className="flex flex-col gap-4 lg:h-(--app-page-viewport-height)">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Organization Settings
        </p>

        <nav aria-label="Organization settings" className="flex flex-col gap-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const active = section.id === activeSection;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {section.label}
              </button>
            );
          })}
        </nav>

        {canCreateOrganization ? (
          <Link
            href="/organizations/new"
            className="mt-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Plus className="size-4" aria-hidden="true" />
            New organization
          </Link>
        ) : null}
      </aside>

      <OrganizationDetailCard
        organization={selectedOrganization}
        ownedOrganizationId={ownedOrganizationId}
        activeSection={activeSection}
      />
    </section>
  );
}
