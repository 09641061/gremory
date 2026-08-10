"use client";

import { Building2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import { SearchableOptions } from "@/contexts/shared/interfaces/components/searchable-options";

export type OrganizationSelectorOrganization = {
  id: string;
  name: string;
  imageUrl?: string | null;
  defaultEstablishmentId?: string;
};

interface OrganizationSelectorProps {
  organization?: OrganizationSelectorOrganization;
  organizations?: ReadonlyArray<OrganizationSelectorOrganization>;
  onSelect?: (organizationId: string, defaultEstablishmentId?: string) => void;
  onSelectAll?: () => void;
  onNew?: () => void;
}

export function OrganizationSelector({
  organization,
  organizations = organization ? [organization] : [],
  onSelect,
  onSelectAll,
  onNew,
}: OrganizationSelectorProps) {
  return (
    <SearchableOptions
      options={organizations}
      selectedId={organization?.id}
      onSelect={(org) => onSelect?.(org.id, org.defaultEstablishmentId)}
      onSelectAll={onSelectAll}
      allLabel="All Organizations"
      searchPlaceholder="Find organization..."
      emptyMessage="No organizations found"
      newLabel="New organization"
      onNew={onNew}
      triggerClassName="gap-2 px-2 font-medium"
    >
      <Avatar className="size-5 border border-border">
        {organization?.imageUrl ? (
          <AvatarImage src={organization.imageUrl} alt={organization.name} />
        ) : (
          <AvatarFallback className="bg-muted">
            <Building2 className="size-3 text-muted-foreground" />
          </AvatarFallback>
        )}
      </Avatar>
      <span className="max-w-44 truncate">{organization?.name ?? "Organization"}</span>
    </SearchableOptions>
  );
}
