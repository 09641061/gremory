"use client";

import { useMemo, useState } from "react";

import type { WorkspaceNavigationOrganizationGroup } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";

import { OrganizationDetailCard } from "./organization-detail-card";
import { OrganizationListCard } from "./organization-list-card";
import { OrganizationsSearchBar } from "./organizations-search-bar";

export type OrganizationListItem = WorkspaceNavigationOrganizationGroup;

export function OrganizationsPage({
  organizations,
  ownedOrganizationId,
}: {
  organizations: ReadonlyArray<OrganizationListItem>;
  ownedOrganizationId: string | null;
}) {
  const [filter, setFilter] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const filteredOrganizations = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return organizations;
    return organizations.filter((org) => org.organizationName.toLowerCase().includes(normalized));
  }, [filter, organizations]);

  const selectedOrg = organizations.find((org) => org.organizationId === selectedOrgId) ?? null;

  return (
    <PageShell>
      <PageHeader
        title="Organizations"
        description="Every organization you can work in, and its establishments."
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className={`w-full space-y-6 lg:flex lg:h-(--app-page-viewport-height) lg:flex-1 lg:flex-col ${selectedOrg ? "hidden lg:flex" : ""}`}>
          <OrganizationsSearchBar value={filter} onChange={setFilter} />

          <OrganizationListCard
            organizations={organizations}
            filteredOrganizations={filteredOrganizations}
            selectedOrgId={selectedOrgId}
            ownedOrganizationId={ownedOrganizationId}
            onSelect={setSelectedOrgId}
          />
        </div>

        <OrganizationDetailCard
          organization={selectedOrg}
          ownedOrganizationId={ownedOrganizationId}
          onCancel={() => setSelectedOrgId(null)}
          className={selectedOrg ? "" : "hidden lg:block"}
        />
      </div>
    </PageShell>
  );
}
