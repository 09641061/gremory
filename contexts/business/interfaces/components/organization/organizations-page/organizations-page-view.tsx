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
  organization: OrganizationSummary | null;
  canUpdate?: boolean;
}) {
  const [filter, setFilter] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const organizations = useMemo(() => (organization ? [organization] : []), [organization]);

  const filteredOrganizations = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return organizations;
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(normalized)
    );
  }, [filter, organizations]);

  const selectedOrg = organizations.find((org) => org.id === selectedOrgId) ?? null;

  if (!organization) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div>
          <h1 className="page-title">Organizations</h1>
          <p className="page-description mt-2">
            Your Free plan is active. Organizations will appear here once the setup flow creates the first one.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-5 py-4 text-sm text-muted-foreground">
          Free keeps the core product available, but this account does not have an organization yet.
        </div>
      </section>
    );
  }

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
