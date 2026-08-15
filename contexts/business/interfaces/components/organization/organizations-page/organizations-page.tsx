"use client";

import { useMemo, useState } from "react";
import { OrganizationsSearchBar } from "./organizations-search-bar";
import { OrganizationListCard } from "./organization-list-card";
import { OrganizationDetailCard } from "./organization-detail-card";
import type { WorkspaceNavigationOrganizationGroup } from "@/contexts/business/domain/services/workspace-navigation.policy";

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
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
      {/* Columna izquierda. En móvil no hay sitio para las dos columnas, así que
          la selección sustituye a la lista y "Back" vuelve a ella. */}
      <div
        className={`w-full space-y-6 lg:flex lg:h-(--app-page-viewport-height) lg:flex-1 lg:flex-col ${
          selectedOrg ? "hidden lg:flex" : ""
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between shrink-0">
          <div>
            <h1 className="page-title">Organizations</h1>
            <p className="page-description mt-2">
              Every organization you can work in, and its establishments.
            </p>
          </div>
        </div>

        <OrganizationsSearchBar value={filter} onChange={setFilter} />

        <OrganizationListCard
          organizations={organizations}
          filteredOrganizations={filteredOrganizations}
          selectedOrgId={selectedOrgId}
          ownedOrganizationId={ownedOrganizationId}
          onSelect={setSelectedOrgId}
        />
      </div>

      {/* Columna derecha */}
      <OrganizationDetailCard
        organization={selectedOrg}
        ownedOrganizationId={ownedOrganizationId}
        onCancel={() => setSelectedOrgId(null)}
        className={selectedOrg ? "" : "hidden lg:block"}
      />
    </section>
  );
}
