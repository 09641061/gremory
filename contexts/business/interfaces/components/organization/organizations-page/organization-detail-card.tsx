"use client";

import { Building2 } from "lucide-react";

import { canManageOrganization } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { updateOrganizationAction } from "@/contexts/business/interfaces/actions/organization.actions";
import { EntityProfileCard } from "@/contexts/business/interfaces/components/entity-profile-card/entity-profile-card";
import { cn } from "@/lib/utils";

import type { OrganizationListItem } from "./organizations-page";

interface OrganizationDetailCardProps {
  organization: OrganizationListItem | null;
  ownedOrganizationId: string | null;
  className?: string;
}

/**
 * Single card for the organization identity: logo + editable name.
 * Establishments live on the Establishments page, not here.
 */
export function OrganizationDetailCard({
  organization,
  ownedOrganizationId,
  className,
}: OrganizationDetailCardProps) {
  if (!organization) {
    return (
      <div className={cn("flex-1", className)}>
        <div className="flex min-h-(--app-page-viewport-height) items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm lg:ml-3">
          <div className="max-w-xs">
            <Building2 className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-foreground">Select an organization</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose an organization to view its details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1", className)}>
      <EntityProfileCard
        key={organization.organizationId}
        entityLabel="Organization"
        photoNoun="logo"
        icon={Building2}
        entityId={organization.organizationId}
        entityName={organization.organizationName}
        photoUrl={organization.organizationImageUrl}
        updateAction={updateOrganizationAction}
        canUpdate={canManageOrganization(organization, ownedOrganizationId)}
        className="lg:ml-3 lg:h-(--app-page-viewport-height)"
      />
    </div>
  );
}
