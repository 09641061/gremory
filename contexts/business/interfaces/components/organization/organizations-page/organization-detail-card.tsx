"use client";

import { Building2 } from "lucide-react";
import type { OrganizationListItem } from "./organizations-page";
import { EntityProfileCard } from "@/contexts/business/interfaces/components/entity-profile-card/entity-profile-card";
import { updateOrganizationAction } from "@/contexts/business/interfaces/actions/organization.actions";
import { canManageOrganization } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { cn } from "@/lib/utils";

interface OrganizationDetailCardProps {
  organization: OrganizationListItem | null;
  ownedOrganizationId: string | null;
  onCancel?: () => void;
  className?: string;
}

/**
 * Editing in place, exactly like an establishment: this is the same
 * name-and-logo editor `/organization` already uses, permission-gated with
 * the workforce's real `business:manage` grant - not a redirect elsewhere.
 */
export function OrganizationDetailCard({
  organization,
  ownedOrganizationId,
  onCancel,
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
              Choose an organization to view or edit it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("hidden flex-1 lg:block", className)}>
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
        onCancel={onCancel}
        className="lg:ml-3 lg:h-(--app-page-viewport-height)"
      />
    </div>
  );
}
