"use client";

import { Building2 } from "lucide-react";

import { canManageOrganization } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { updateOrganizationAction } from "@/contexts/business/interfaces/actions/organization.actions";
import { EntityProfileCard } from "@/contexts/business/interfaces/components/entity-profile-card/entity-profile-card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/contexts/shared/interfaces/components/ui/empty";
import { cn } from "@/lib/utils";

import type { OrganizationListItem } from "./organizations-page";

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
        <Empty className="min-h-(--app-page-viewport-height) lg:ml-3">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 className="size-4" />
            </EmptyMedia>
            <EmptyTitle>Select an organization</EmptyTitle>
            <EmptyDescription>Choose an organization to view or edit it.</EmptyDescription>
          </EmptyHeader>
        </Empty>
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
