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
  const selectedEstablishmentId = searchParams.get("establishmentId") || workspace.activeEstablishmentId;
  const newEstablishmentHref = navigation.newEstablishmentHref;

  function handleSelectOrganization(orgId: string, defaultEstablishmentId?: string) {
    router.push(
      buildWorkspacePath(pathname, searchParams, orgId, defaultEstablishmentId),
    );
  }

  return (
    <Header
      homeHref={resolveHomeHrefWithEstablishment(homeHref, selectedOrganizationId, selectedEstablishmentId)}
      organizationSlot={
        <OrganizationSelector
          organization={workspace.organization}
          organizations={workspace.organizations}
          onSelect={handleSelectOrganization}
          onSelectAll={() => {
            if (navigation.organizationListHref) {
              router.push(buildWorkspacePath(
                navigation.organizationListHref,
                searchParams,
                selectedOrganizationId,
                selectedEstablishmentId,
              ));
            } else {
              router.push(`${pathname}?denied=org`);
            }
          }}
        />
      }
      establishmentSlot={
        <EstablishmentSelector
          establishments={workspace.establishments}
          selectedEstablishmentId={selectedEstablishmentId}
          onSelect={(establishmentId) => {
            router.push(buildWorkspacePath(pathname, searchParams, selectedOrganizationId, establishmentId));
          }}
          onSelectAll={() => {
            if (navigation.establishmentListHref) {
              router.push(buildWorkspacePath(
                navigation.establishmentListHref,
                searchParams,
                selectedOrganizationId,
                selectedEstablishmentId,
              ));
            } else {
              router.push(`${pathname}?denied=est`);
            }
          }}
          onNew={
            newEstablishmentHref
              ? () => router.push(newEstablishmentHref)
              : undefined
          }
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
