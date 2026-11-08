import "server-only";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { OperationAuthorizationError, requireAuthenticatedToken } from "@/contexts/shared/interfaces/authorization/operation-authorization";

/**
 * Capability-based Max access decision.
 *
 * The backend has not yet confirmed a dedicated `analytics:max` capability.
 * Until that contract exists, require both existing analytics capabilities and
 * never infer access from the user-visible subscription name.
 */
export async function requireAnalyticsContext(establishmentId?: string) {
  const token = await requireAuthenticatedToken();
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
  const id = establishmentId ?? workspace.activeEstablishmentId;
  const establishment = getWorkspaceEstablishment(workspace, id);
  if (!establishment || !hasEstablishmentPermission(establishment, "analytics:read")) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }
  if (!workspace.organization?.id) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }
  return {
    token,
    organizationId: workspace.organization.id,
    establishmentId: establishment.id,
    canRequestMax: canRequestMaxAnalytics(workspace),
  };
}

export function canRequestMaxAnalytics(
  workspace: Pick<WorkspaceHeaderViewModel, "capabilities" | "accessPolicy">,
): boolean {
  return (
    workspace.capabilities?.canReadAnalytics === true &&
    workspace.accessPolicy?.canOpenAnalytics === true
  );
}
