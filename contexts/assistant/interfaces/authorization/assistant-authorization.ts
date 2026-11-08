import "server-only";

import { z } from "zod";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { getWorkspaceEstablishment } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { OperationAuthorizationError, requireAuthenticatedToken } from "@/contexts/shared/interfaces/authorization/operation-authorization";

const idSchema = z.string().uuid();

/** Server-side Assistant access check. Client establishment IDs are never trusted. */
export async function authorizeAssistantAccess(establishmentId?: string | null): Promise<{
  token: string;
  organizationId?: string;
  establishmentId?: string;
}> {
  const token = await requireAuthenticatedToken();
  if (establishmentId && !idSchema.safeParse(establishmentId).success) {
    throw new OperationAuthorizationError("INVALID_RESOURCE");
  }

  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel(
    establishmentId ? { establishmentId } : {},
  );
  if (workspace.accessPolicy?.canUseAssistant !== true) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }

  if (!establishmentId) {
    return { token, organizationId: workspace.organization?.id };
  }

  const establishment = getWorkspaceEstablishment(workspace, establishmentId);
  if (!establishment || establishment.canRead === false) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }

  return {
    token,
    organizationId: establishment.organizationId ?? workspace.organization?.id,
    establishmentId,
  };
}
