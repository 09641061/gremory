"use client";

import { Building2 } from "lucide-react";

import { StatusBadge } from "@/contexts/shared/interfaces/components/ui/status-badge";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { EntityListRow } from "@/contexts/shared/interfaces/components/entity-list-row";
import type { OrganizationListItem } from "./organizations-page";
import { useBusinessTranslations } from "@/contexts/business/interfaces/i18n";

interface OrganizationListCardProps {
  filteredOrganizations: ReadonlyArray<OrganizationListItem>;
  previewOrgId: string | null;
  activeOrganizationId: string | null;
  onPreview: (id: string) => void;
}

export function OrganizationListCard({
  filteredOrganizations,
  previewOrgId,
  activeOrganizationId,
  onPreview,
}: OrganizationListCardProps) {
  const { t } = useBusinessTranslations();

  return (
    <Card className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      <CardContent className="p-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <div className="scrollbar-hide lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {filteredOrganizations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-12 text-center text-sm text-muted-foreground">
              <Building2 className="size-8" aria-hidden="true" />
              <span>{t.organizations.noOrganizationsFound}</span>
            </div>
          ) : (
            filteredOrganizations.map((org) => {
              const previewing = org.organizationId === previewOrgId;
              const active = org.organizationId === activeOrganizationId;
              return (
                <EntityListRow
                  key={org.organizationId}
                  avatarSrc={org.organizationImageUrl}
                  avatarFallbackIcon={<Building2 className="size-4" />}
                  name={org.organizationName}
                  selected={previewing}
                  onSelect={() => onPreview(org.organizationId)}
                  badges={
                    active ? <StatusBadge tone="success">{t.organizations.selected}</StatusBadge> : null
                  }
                />
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
