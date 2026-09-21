"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { setWorkspaceSelectionAction } from "@/contexts/business/interfaces/actions/workspace-selection.actions";
import { OrganizationsSearchBar } from "./organizations-search-bar";
import { OrganizationListCard } from "./organization-list-card";
import { OrganizationDetailCard } from "./organization-detail-card";
import type { WorkspaceNavigationOrganizationGroup } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { useBusinessTranslations } from "@/contexts/business/interfaces/i18n";


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
  const { t } = useBusinessTranslations();
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
    const confirmed = organizations.find((org) => org.organizationId === organizationId) ?? null;
    setActiveOrgId(organizationId);
    if (confirmed) {
      const establishmentId = confirmed.establishments[0]?.id ?? null;
      startTransition(() => {
        void setWorkspaceSelectionAction({
          organizationId,
          establishmentId,
          previewOrganizationId: organizationId,
        });
      });
      if (organizationId === ownedOrganizationId && !establishmentId) {
        router.push(`/establishments/setup?organizationId=${encodeURIComponent(organizationId)}`);
      } else {
        const params = new URLSearchParams({ organizationId });
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
            <h1 className="page-title">{t.organizations.title}</h1>
            <p className="page-description mt-2">
              {t.organizations.pageDescription}
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
