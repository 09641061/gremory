import "server-only";

import { z } from "zod";

import { composeBusinessAdapters } from "../server/business-composition";
import { requireAuthenticatedToken, OperationAuthorizationError } from "@/contexts/shared/interfaces/authorization/operation-authorization";
import { getWorkspaceEstablishment } from "@/contexts/shared/application/services/workspace-establishment-permissions";

const idSchema = z.string().uuid();

type Capability = "canRead" | "canUpdate" | "canDelete";

/**
 * Verify the caller may act on a specific establishment. Authorization is
 * target-aware: it asks the workspace query service for the establishment
 * with the requested id and refuses when the workspace does not contain it.
 * No unbounded scans.
 */
export async function requireEstablishmentCapability(
  id: string,
  capability: Capability,
): Promise<{ token: string; organizationId?: string; establishmentId: string }> {
  const token = await requireAuthenticatedToken();
  if (!idSchema.safeParse(id).success) {
    throw new OperationAuthorizationError("INVALID_RESOURCE");
  }
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({
    establishmentId: id,
  });
  const item = getWorkspaceEstablishment(workspace, id);
  if (!item || item[capability] !== true) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }
  return {
    token,
    organizationId: workspace.organization?.id,
    establishmentId: id,
  };
}

/**
 * Verify the caller may act on a specific organization. Target-aware: the
 * workspace query service is asked for the organization with the requested
 * id, and we refuse when the workspace does not contain it.
 */
export async function requireOrganizationCapability(
  id: string,
  capability: "canRead" | "canUpdate",
): Promise<{ token: string; organizationId: string }> {
  const token = await requireAuthenticatedToken();
  if (!idSchema.safeParse(id).success) {
    throw new OperationAuthorizationError("INVALID_RESOURCE");
  }
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel();
  if (workspace.organization?.id !== id || workspace.organization[capability] !== true) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }
  return { token, organizationId: id };
}
