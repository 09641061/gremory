"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { OrganizationsSearchBar } from "./organizations-search-bar";
import { OrganizationListCard } from "./organization-list-card";
import { OrganizationDetailCard } from "./organization-detail-card";
import type { WorkspaceNavigationOrganizationGroup } from "@/contexts/business/domain/services/workspace-navigation.policy";


export type OrganizationListItem = WorkspaceNavigationOrganizationGroup;

export function OrganizationsPage({
  organizations,
  ownedOrganizationId,
  activeOrganizationId,
  initialPreviewOrganizationId = null,
  canCreateOrganization = false,
}: {
  organizations: ReadonlyArray<OrganizationListItem>;
  ownedOrganizationId: string | null;
  activeOrganizationId: string | null;
  initialPreviewOrganizationId?: string | null;
  canCreateOrganization?: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [previewOrgId, setPreviewOrgId] = useState<string | null>(initialPreviewOrganizationId);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(activeOrganizationId);

  useEffect(() => {
    startTransition(() => setPreviewOrgId(initialPreviewOrganizationId));
  }, [initialPreviewOrganizationId]);

  useEffect(() => {
    startTransition(() => setActiveOrgId(activeOrganizationId));
  }, [activeOrganizationId]);

  const filteredOrganizations = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return organizations;
    return organizations.filter((org) => org.organizationName.toLowerCase().includes(normalized));
  }, [filter, organizations]);

  const previewOrg = organizations.find((org) => org.organizationId === previewOrgId) ?? null;

  const handleSelectOrganization = (organizationId: string) => {
    setPreviewOrgId(organizationId);
    document.cookie = `${workspaceSelectionCookies.previewOrganizationId}=${encodeURIComponent(
      organizationId,
    )}; path=/; max-age=${60 * 60 * 24 * 180}; SameSite=Lax`;

    const confirmed = organizations.find((org) => org.organizationId === organizationId) ?? null;
    setActiveOrgId(organizationId);
    if (confirmed) {
      document.cookie = `takodu.active_organization_id=${encodeURIComponent(organizationId)}; path=/; max-age=${60 * 60 * 24 * 180}; sameSite=lax`;
      if (confirmed.establishments.length > 0) {
        document.cookie = `takodu.active_establishment_id=${encodeURIComponent(
          confirmed.establishments[0].id,
        )}; path=/; max-age=${60 * 60 * 24 * 180}; sameSite=lax`;
      } else {
        document.cookie = "takodu.active_establishment_id=; path=/; max-age=0; sameSite=lax";
      }
      if (organizationId === ownedOrganizationId && confirmed.establishments.length === 0) {
        router.push(`/establishments/setup?organizationId=${encodeURIComponent(organizationId)}`);
      } else {
        const params = new URLSearchParams({ organizationId });
        const establishmentId = confirmed.establishments[0]?.id;
        if (establishmentId) params.set("establishmentId", establishmentId);
        router.push(`/?${params.toString()}`);
      }
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
      <div
        className={`w-full space-y-6 lg:flex lg:h-(--app-page-viewport-height) lg:flex-1 lg:flex-col ${
          previewOrg ? "hidden lg:flex" : ""
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between shrink-0">
          <div>
            <h1 className="page-title">Organizations</h1>
            <p className="page-description mt-2">
              Manage your organization&apos;s identity and the establishments inside it.
            </p>
          </div>
        </div>
        <OrganizationsSearchBar value={filter} onChange={setFilter} canCreate={canCreateOrganization} />
        <OrganizationListCard
          filteredOrganizations={filteredOrganizations}
          previewOrgId={previewOrgId}
          activeOrganizationId={activeOrgId}
          onPreview={handleSelectOrganization}
        />
      </div>

      <OrganizationDetailCard
        organization={previewOrg}
        ownedOrganizationId={ownedOrganizationId}
        className={previewOrg ? "" : "hidden lg:block"}
      />
    </section>
  );
}
