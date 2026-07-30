"use client";

import { useMemo, useState } from "react";
import type { OrganizationSummary } from "@/contexts/business/application/model/business.read-models";
import { OrganizationsSearchBar } from "./organizations-search-bar";
import { OrganizationListCard } from "./organization-list-card";
import { OrganizationDetailCard } from "./organization-detail-card";

export function OrganizationsPageView({
  organization,
  canUpdate = true,
}: {
  organization: OrganizationSummary;
  canUpdate?: boolean;
}) {
  const [filter, setFilter] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const organizations = useMemo(() => [organization], [organization]);

  const filteredOrganizations = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return organizations;
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(normalized)
    );
  }, [filter, organizations]);

  const selectedOrg = organizations.find((org) => org.id === selectedOrgId) ?? null;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
      {/* Columna izquierda */}
      <div className="w-full space-y-6 lg:flex-1 lg:flex lg:flex-col lg:h-[calc(100vh-10rem)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between shrink-0">
          <div>
            <h1 className="page-title">Organizations</h1>
            <p className="page-description mt-2">
              Search, create, and manage the organizations available in your account.
            </p>
          </div>
        </div>

        <OrganizationsSearchBar value={filter} onChange={setFilter} />

        <OrganizationListCard
          organizations={organizations}
          filteredOrganizations={filteredOrganizations}
          selectedOrgId={selectedOrgId}
          onSelect={setSelectedOrgId}
        />
      </div>

      {/* Columna derecha */}
      <OrganizationDetailCard
        organization={selectedOrg}
        canUpdate={canUpdate}
        onCancel={() => setSelectedOrgId(null)}
      />
    </section>
  );
}
