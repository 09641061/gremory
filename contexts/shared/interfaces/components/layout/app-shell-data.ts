import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { headers } from "next/headers";

import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { composeBillingAdapters } from "@/contexts/billing/interfaces/server/billing-composition";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { getMyProfileServerQuery } from "@/contexts/profiles/interfaces/queries/get-my-profile.query-handler";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import type { WorkspaceHeaderOrganization } from "@/contexts/business/application/model/business-workspace.view-models";
// Header and navigation share the existing request-scoped shell resolution.
export const getAppShellData = cache(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;
  const requestHeaders = await headers();
  const establishmentId = requestHeaders.get("x-takodu-establishment-id") ?? undefined;
  const activeOrganizationId = cookieStore.get(workspaceSelectionCookies.organizationId)?.value ?? null;
  const shell = accessToken
    ? await createAppShellQueryService(
        composeBusinessAdapters().workspaceQueryService,
        composeBillingAdapters().currentSubscriptionService,
      )
        .resolve({ workspace: { establishmentId }, accessToken })
        .catch((error) => {
          logAppShellError("app shell resolve", error);
          return null;
        })
    : null;

  if (!shell) {
    return null;
  }

  const workspace = await resolveSidebarWorkspace(shell.workspace, activeOrganizationId);
  const currentProfile = await getMyProfileServerQuery();
  return { shell, workspace, currentProfile };
});

export function logAppShellError(context: string, error: unknown): void {
  if (error instanceof ApiError && error.status === 401) {
    recordSafely("shared.app-shell.unauthorized", {
      status: error.status,
      code: "STALE_ACCESS_TOKEN",
      context: { operation: context },
      cause: error,
    });
    return;
  }
  recordSafely("shared.app-shell.failed", {
    context: { operation: context },
    cause: error,
  });
}

async function resolveSidebarWorkspace(
  workspace: WorkspaceHeaderViewModel,
  activeOrganizationId: string | null,
): Promise<WorkspaceHeaderViewModel> {
  if (!activeOrganizationId || !workspace.organization || workspace.organization.id === activeOrganizationId) {
    return workspace;
  }

  const activeOrganization = await composeBusinessAdapters().organizationQueryService.getById({ id: activeOrganizationId }).catch(() => null);
  if (!activeOrganization) {
    return workspace;
  }

  const isOwnedOrganization = workspace.ownedOrganizationId === activeOrganizationId;
  const selectedOrganization: WorkspaceHeaderOrganization = {
    id: activeOrganization.id,
    name: activeOrganization.name,
    imageUrl: activeOrganization.imageUrl,
    canRead: isOwnedOrganization || workspace.organization.canRead === true,
    canUpdate: isOwnedOrganization || workspace.organization.canUpdate === true,
    canReadEstablishments: isOwnedOrganization ? true : workspace.organization.canReadEstablishments === true,
    canCreateEstablishment: isOwnedOrganization ? true : workspace.organization.canCreateEstablishment === true,
  };

  return {
    ...workspace,
    organization: selectedOrganization,
    establishments: workspace.establishments.filter(
      (establishment) => !establishment.organizationId || establishment.organizationId === activeOrganizationId,
    ),
    activeEstablishmentId: workspace.establishments.some(
      (establishment) =>
        establishment.id === workspace.activeEstablishmentId &&
        (!establishment.organizationId || establishment.organizationId === activeOrganizationId),
    )
      ? workspace.activeEstablishmentId
      : undefined,
  };
}
