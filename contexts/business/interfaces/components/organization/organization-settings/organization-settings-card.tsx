"use client";

import { Building2 } from "lucide-react";
import { updateOrganizationAction } from "@/contexts/business/interfaces/actions/organization.actions";
import { EntityProfileCard } from "@/contexts/business/interfaces/components/entity-profile-card/entity-profile-card";

type OrganizationDetails = Readonly<{
  id: string;
  name: string;
  imageUrl?: string | null;
}>;

interface OrganizationSettingsCardProps {
  organization: OrganizationDetails;
  canUpdate?: boolean;
}

export function OrganizationSettingsCard({
  organization,
  canUpdate = true,
}: OrganizationSettingsCardProps) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Organization</h1>
        <p className="page-description mt-2">
          Manage the name and the logo your customers see.
        </p>
      </div>

      <EntityProfileCard
        entityLabel="Organization"
        photoNoun="logo"
        icon={Building2}
        entityId={organization.id}
        entityName={organization.name}
        photoUrl={organization.imageUrl ?? null}
        updateAction={updateOrganizationAction}
        canUpdate={canUpdate}
      />
    </div>
  );
}
