"use client";

import { usePathname, useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { EstablishmentSelector } from "@/contexts/business/interfaces/components/establishment/establishment-selector/establishment-selector";
import { OrganizationLabel } from "../organization-label/organization-label";
import type {
  WorkspaceHeaderViewModel,
} from "@/contexts/business/application/model/business-workspace.view-models";
import { resolveEmployeeEntryPath } from "@/contexts/shared/application/services/entry-route-access.policy";

interface ProtectedHeaderClientProps {
  workspace: WorkspaceHeaderViewModel;
  homeHref: string;
}

export function ProtectedHeaderClient({
  workspace,
  homeHref,
}: ProtectedHeaderClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { organization, establishments, accountType, subscription } = workspace;
  const requestedEstablishmentId = searchParams.get("establishmentId");
  const selectedEstablishmentId =
    requestedEstablishmentId &&
    establishments.some((establishment) => establishment.id === requestedEstablishmentId)
      ? requestedEstablishmentId
      : workspace.activeEstablishmentId;

  function navigateToWorkspace(path: string) {
    router.push(path);
  }

  return (
    <Header
      subscription={subscription}
      homeHref={buildWorkspacePath(homeHref, new URLSearchParams(), selectedEstablishmentId)}
      organizationSlot={
        <OrganizationLabel
          organization={organization}
          // Clicking the organization opens its settings, where the name and
          // the logo are changed.
          href={workspace.canReadOrganization ? "/organization" : undefined}
        />
      }
      establishmentSlot={
        <EstablishmentSelector
          establishments={establishments}
          selectedEstablishmentId={selectedEstablishmentId}
          onSelect={(establishmentId) => {
            const establishment = establishments.find((item) => item.id === establishmentId);
            globalThis.location.assign(
              buildWorkspacePath(
                resolveEstablishmentEntryPath(accountType, establishment, pathname),
                searchParams,
                establishmentId,
              ),
            );
          }}
          onSelectAll={workspace.canReadEstablishments
            ? () => navigateToWorkspace(
                buildWorkspacePath("/establishments", searchParams, selectedEstablishmentId),
              )
            : undefined}
          onNew={workspace.canCreateEstablishment
            ? () => navigateToWorkspace("/establishments/new")
            : undefined}
        />
      }
    />
  );
}

function resolveEstablishmentEntryPath(
  accountType: WorkspaceHeaderViewModel["accountType"],
  establishment: WorkspaceHeaderViewModel["establishments"][number] | undefined,
  fallbackPath: string,
) {
  if (accountType === "OWNER" || !establishment) return fallbackPath;

  return resolveEmployeeEntryPath(
    [
      {
        establishmentId: establishment.id,
        establishmentName: establishment.name,
        effectivePermissions: establishment.effectivePermissions ?? [],
      },
    ],
    false,
  );
}

function buildWorkspacePath(
  pathname: string,
  searchParams: Pick<ReadonlyURLSearchParams, "toString">,
  establishmentId?: string,
) {
  const params = new URLSearchParams(searchParams.toString());
  params.delete("organizationId");
  if (establishmentId) params.set("establishmentId", establishmentId);
  else params.delete("establishmentId");
  return params.toString() ? `${pathname}?${params.toString()}` : pathname;
}
