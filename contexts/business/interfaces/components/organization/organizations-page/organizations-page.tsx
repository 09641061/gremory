"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
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
}: {
  organizations: ReadonlyArray<OrganizationListItem>;
  ownedOrganizationId: string | null;
  activeOrganizationId: string | null;
  initialPreviewOrganizationId?: string | null;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [previewOrgId, setPreviewOrgId] = useState<string | null>(initialPreviewOrganizationId);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(activeOrganizationId);

  useEffect(() => {
    setPreviewOrgId(initialPreviewOrganizationId);
  }, [initialPreviewOrganizationId]);

  useEffect(() => {
    setActiveOrgId(activeOrganizationId);
  }, [activeOrganizationId]);

  const filteredOrganizations = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return organizations;
    return organizations.filter((org) => org.organizationName.toLowerCase().includes(normalized));
  }, [filter, organizations]);

  const previewOrg = organizations.find((org) => org.organizationId === previewOrgId) ?? null;
  const activeOrg = organizations.find((org) => org.organizationId === activeOrgId) ?? null;

  const persistPreviewOrganizationId = (organizationId: string) => {
    setPreviewOrgId(organizationId);
    document.cookie = `${workspaceSelectionCookies.previewOrganizationId}=${encodeURIComponent(
      organizationId,
    )}; path=/; max-age=${60 * 60 * 24 * 180}; SameSite=Lax`;
  };

  const handleConfirmOrganization = (organizationId: string) => {
    const confirmed = organizations.find((org) => org.organizationId === organizationId) ?? null;
    setActiveOrgId(organizationId);
    persistPreviewOrganizationId(organizationId);
    if (confirmed) {
      document.cookie = `takodu.active_organization_id=${encodeURIComponent(organizationId)}; path=/; max-age=${60 * 60 * 24 * 180}; sameSite=lax`;
      if (confirmed.establishments.length > 0) {
        document.cookie = `takodu.active_establishment_id=${encodeURIComponent(
          confirmed.establishments[0].id,
        )}; path=/; max-age=${60 * 60 * 24 * 180}; sameSite=lax`;
      } else {
        document.cookie = "takodu.active_establishment_id=; path=/; max-age=0; sameSite=lax";
      }
      router.refresh();
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row lg:items-start">
      {/* On mobile there is not enough room for two columns, so the selected
          organization replaces the list and the back action brings it back. */}
      <div
        className={`w-full space-y-6 lg:flex lg:h-(--app-page-viewport-height) lg:flex-1 lg:flex-col ${
          activeOrg ? "hidden lg:flex" : ""
        }`}
      >
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm shrink-0">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <Building2 className="size-3.5" />
                Organization hub
              </div>
              <h1 className="page-title mt-4">Organizations</h1>
              <p className="page-description mt-3 max-w-xl">
                Choose the organization you want to manage. The right panel shows
                its settings and the establishments inside it.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {organizations.length} organizations
                </span>
                {activeOrg ? (
                  <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {activeOrg.organizationName}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Link href="/organizations/new" className={buttonVariants({ variant: "outline" })}>
                New organization
              </Link>
              <p className="text-xs text-muted-foreground">
                Switch here, then create or edit from the selected organization.
              </p>
            </div>
          </div>
        </div>

        <OrganizationsSearchBar value={filter} onChange={setFilter} />

        <OrganizationListCard
          organizations={organizations}
          filteredOrganizations={filteredOrganizations}
          previewOrgId={previewOrgId}
          previewOrganization={previewOrg}
          activeOrganizationId={activeOrgId}
          ownedOrganizationId={ownedOrganizationId}
          onPreview={persistPreviewOrganizationId}
          onConfirm={handleConfirmOrganization}
        />
      </div>

      <OrganizationDetailCard
        organization={previewOrg}
        ownedOrganizationId={ownedOrganizationId}
        onCancel={() => setPreviewOrgId(null)}
        className={previewOrg ? "" : "hidden lg:block"}
        selectedEstablishments={previewOrg?.establishments ?? []}
      />
    </section>
  );
}
