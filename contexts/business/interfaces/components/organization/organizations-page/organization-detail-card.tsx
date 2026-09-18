"use client";

import { Building2 } from "lucide-react";

import { updateOrganizationAction } from "@/contexts/business/interfaces/actions/organization.actions";
import { EntityProfileCard } from "@/contexts/business/interfaces/components/entity-profile-card/entity-profile-card";
import { Card } from "@/contexts/shared/interfaces/components/ui/card";
import { cn } from "@/lib/utils";
import { useBusinessTranslations } from "@/contexts/business/interfaces/i18n";

import { OrganizationEstablishmentsPanel } from "./organization-establishments-panel";
import { OrganizationInvitesPanel } from "./organization-invites-panel";
import { OrganizationMembersPanel } from "./organization-members-panel";
import { OrganizationRolesPanel } from "./organization-roles-panel";
import type { OrganizationListItem } from "./organizations-page";

export type OrganizationSection =
  | "organization"
  | "establishments"
  | "members"
  | "invites"
  | "roles";

interface OrganizationDetailCardProps {
  organization: OrganizationListItem | null;
  ownedOrganizationId: string | null;
  activeSection: OrganizationSection;
  className?: string;
}

/**
 * Section-driven settings panel: identity (Organization) plus the team and access
 * surfaces (Establishments, Members, Roles). The section is controlled by the internal
 * sidebar, so this card no longer renders a horizontal tab bar and lets its content use
 * the full remaining width.
 */
export function OrganizationDetailCard({
  organization,
  ownedOrganizationId,
  activeSection,
  className,
}: OrganizationDetailCardProps) {
  const { t } = useBusinessTranslations();

  const ownsOrganization = organization?.organizationId === ownedOrganizationId;
  const effectivePermissions = new Set(
    (organization?.establishments ?? []).flatMap(
      (establishment) => establishment.effectivePermissions ?? [],
    ),
  );
  const hasPermission = (code: string) => ownsOrganization || effectivePermissions.has(code);
  const canManageOrganization = hasPermission("organization:update");
  const canManageEstablishments =
    hasPermission("establishment:update") || hasPermission("establishment:create");
  const canInviteMembers = hasPermission("workforce:member:invite");
  const canManageMembers = hasPermission("workforce:member:manage");

  if (!organization) {
    return (
      <div className={cn("flex-1", className)}>
        <div className="flex min-h-(--app-page-viewport-height) items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="max-w-xs">
            <Building2 className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-foreground">{t.organizations.selectPromptTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.organizations.selectPromptDescription}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1", className)}>
      <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-xl border-border bg-card py-0 shadow-sm lg:h-(--app-page-viewport-height)">
        <div
          className="flex min-h-0 flex-1 flex-col"
          style={{ display: activeSection === "organization" ? undefined : "none" }}
        >
          <EntityProfileCard
            key={organization.organizationId}
            entityLabel="Organization"
            photoNoun="logo"
            icon={Building2}
            entityId={organization.organizationId}
            entityName={organization.organizationName}
            photoUrl={organization.organizationImageUrl}
            updateAction={updateOrganizationAction}
            canUpdate={canManageOrganization}
            className="min-h-0 flex-1 rounded-none border-0 shadow-none"
          />
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col"
          style={{ display: activeSection === "establishments" ? undefined : "none" }}
        >
          <OrganizationEstablishmentsPanel
            organizationId={organization.organizationId}
            canUpdate={canManageEstablishments}
            canCreate={hasPermission("establishment:create")}
          />
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col"
          style={{ display: activeSection === "members" ? undefined : "none" }}
        >
          <OrganizationMembersPanel
            organizationId={organization.organizationId}
            establishments={organization.establishments.map((establishment) => ({
              id: establishment.id,
              name: establishment.name,
            }))}
            canInvite={canInviteMembers}
            canManageMembers={canManageMembers}
            lockedEstablishmentId={
              canManageMembers ? null : organization.establishments[0]?.id ?? null
            }
          />
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col"
          style={{ display: activeSection === "invites" ? undefined : "none" }}
        >
          <OrganizationInvitesPanel
            organizationId={organization.organizationId}
            establishments={organization.establishments.map((establishment) => ({
              id: establishment.id,
              name: establishment.name,
            }))}
            canInvite={canInviteMembers}
            canManageMembers={canManageMembers}
            lockedEstablishmentId={
              canManageMembers ? null : organization.establishments[0]?.id ?? null
            }
          />
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col"
          style={{ display: activeSection === "roles" ? undefined : "none" }}
        >
          <OrganizationRolesPanel organizationId={organization.organizationId} />
        </div>
      </Card>
    </div>
  );
}
