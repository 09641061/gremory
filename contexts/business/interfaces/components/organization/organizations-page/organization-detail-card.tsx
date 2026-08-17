"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import type { OrganizationListItem } from "./organizations-page";
import { EntityProfileCard } from "@/contexts/business/interfaces/components/entity-profile-card/entity-profile-card";
import { updateOrganizationAction } from "@/contexts/business/interfaces/actions/organization.actions";
import { canManageOrganization } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import { Store } from "lucide-react";

interface OrganizationDetailCardProps {
  organization: OrganizationListItem | null;
  ownedOrganizationId: string | null;
  selectedEstablishments: ReadonlyArray<OrganizationListItem["establishments"][number]>;
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
  selectedEstablishments,
  onCancel,
  className,
}: OrganizationDetailCardProps) {
  if (!organization) {
    return (
      <div className={cn("flex-1", className)}>
        <div className="flex min-h-(--app-page-viewport-height) items-center justify-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm lg:ml-3">
          <div className="max-w-sm">
            <Building2 className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-foreground">Select an organization</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick one from the list to edit it and see the establishments inside it.
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
        className="lg:ml-3"
      />
      <div className="ml-3 mt-3 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Accessible establishments</p>
            <p className="text-xs text-muted-foreground">
              {selectedEstablishments.length === 0
                ? "No establishments assigned"
                : `You have access to ${selectedEstablishments.length} establishment${
                    selectedEstablishments.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {organization.organizationId === ownedOrganizationId ? "Yours" : "Member"}
          </span>
        </div>

        {selectedEstablishments.length === 0 ? (
          <div className="p-5">
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
                <p className="text-sm font-medium text-foreground">
                  {organization.organizationId === ownedOrganizationId
                    ? "No establishments yet"
                    : "No establishments assigned"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {organization.organizationId === ownedOrganizationId
                    ? "Create an establishment to start using this organization."
                    : "You currently do not have access to any establishment in this organization."}
                </p>
                {organization.canCreateEstablishment ? (
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/establishments/new?organizationId=${encodeURIComponent(
                      organization.organizationId,
                    )}`}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    New establishment
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto p-3">
            {selectedEstablishments.map((establishment) => (
              <Link
                key={establishment.id}
                href={`/establishments?organizationId=${encodeURIComponent(
                  organization.organizationId,
                )}&establishmentId=${encodeURIComponent(establishment.id)}`}
                className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/40"
              >
                <Avatar className="size-9">
                  {establishment.photoUrl ? (
                    <AvatarImage src={establishment.photoUrl} alt={establishment.name} />
                  ) : (
                    <AvatarFallback>
                      <Store className="size-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{establishment.name}</p>
                    <p className="truncate text-xs text-muted-foreground">Open accessible establishment</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
