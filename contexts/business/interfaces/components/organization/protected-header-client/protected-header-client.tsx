"use client";

import { usePathname, useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { EstablishmentSelector } from "@/contexts/business/interfaces/components/establishment/establishment-selector/establishment-selector";
import { OrganizationSelector } from "../organization-selector/organization-selector";
import type {
  WorkspaceHeaderViewModel,
} from "@/contexts/business/application/model/business-workspace.view-models";
import type { HeaderNavigationViewModel } from "@/contexts/shared/application/model/app-shell.view-models";

interface ProtectedHeaderClientProps {
  workspace: WorkspaceHeaderViewModel;
  navigation: HeaderNavigationViewModel;
  homeHref: string;
}

export function ProtectedHeaderClient({
  workspace,
  navigation,
  homeHref,
}: ProtectedHeaderClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedOrganizationId = searchParams.get("organizationId") || workspace.activeOrganizationId;
  const selectedOrganization = workspace.organizations.find(
    (organization) => organization.id === selectedOrganizationId,
  ) ?? workspace.organization;
  const establishments = selectedOrganization?.establishments ?? workspace.establishments;
  const requestedEstablishmentId = searchParams.get("establishmentId");
  const selectedEstablishmentId = requestedEstablishmentId && establishments.some(
    (establishment) => establishment.id === requestedEstablishmentId,
  )
    ? requestedEstablishmentId
    : selectedOrganization?.id === workspace.activeOrganizationId
      ? workspace.activeEstablishmentId
      : selectedOrganization?.defaultEstablishmentId;
  // Establishment entry points follow the organization selected in the header,
  // not the one the server resolved, so switching organizations never leaves a
  // stale action behind.
  const canReadEstablishments = selectedOrganization?.canReadEstablishments === true;
  const canCreateEstablishment = selectedOrganization?.canCreateEstablishment === true;
  const { organizationListHref, newOrganizationHref } = navigation;

  function navigateToWorkspace(path: string) {
    router.push(path);
    router.refresh();
  }

  function handleSelectOrganization(orgId: string, defaultEstablishmentId?: string) {
    navigateToWorkspace(
      buildWorkspacePath(pathname, searchParams, orgId, defaultEstablishmentId),
    );
  }

  return (
    <Header
      homeHref={resolveHomeHrefWithEstablishment(homeHref, selectedOrganizationId, selectedEstablishmentId)}
      organizationSlot={
        <OrganizationSelector
          organization={selectedOrganization}
          organizations={workspace.organizations}
          onSelect={handleSelectOrganization}
          onSelectAll={organizationListHref
            ? () => navigateToWorkspace(buildWorkspacePath(
                organizationListHref,
                searchParams,
                selectedOrganizationId,
                selectedEstablishmentId,
              ))
            : undefined}
          onNew={newOrganizationHref
            ? () => navigateToWorkspace(newOrganizationHref)
            : undefined}
        />
      }
      establishmentSlot={
        <EstablishmentSelector
          establishments={establishments}
          selectedEstablishmentId={selectedEstablishmentId}
          onSelect={(establishmentId) => {
            navigateToWorkspace(buildWorkspacePath(pathname, searchParams, selectedOrganizationId, establishmentId));
          }}
          onSelectAll={canReadEstablishments
            ? () => navigateToWorkspace(buildWorkspacePath(
                "/establishments",
                searchParams,
                selectedOrganizationId,
                selectedEstablishmentId,
              ))
            : undefined}
          onNew={canCreateEstablishment
            ? () => navigateToWorkspace(buildWorkspacePath(
                "/establishments/new",
                searchParams,
                selectedOrganization?.id,
              ))
            : undefined}
        />
      }
    />
  );
}

function resolveHomeHrefWithEstablishment(
  homeHref: string,
  organizationId?: string,
  establishmentId?: string,
) {
  return buildWorkspacePath(homeHref, new URLSearchParams(), organizationId, establishmentId);
}

function buildWorkspacePath(
  pathname: string,
  searchParams: Pick<ReadonlyURLSearchParams, "toString">,
  organizationId?: string,
  establishmentId?: string,
) {
  const params = new URLSearchParams(searchParams.toString());
  if (organizationId) params.set("organizationId", organizationId);
  else params.delete("organizationId");
  if (establishmentId) params.set("establishmentId", establishmentId);
  else params.delete("establishmentId");
  return params.toString() ? `${pathname}?${params.toString()}` : pathname;
}
