import "server-only";
import { z } from "zod";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { OperationAuthorizationError, requireAuthenticatedToken } from "@/contexts/shared/interfaces/authorization/operation-authorization";
import { composeCatalogAdapters } from "../server/catalog-composition";

const idSchema = z.string().uuid();

async function context(permission: string = "catalog:manage", requestedEstablishmentId?: string) {
  const token = await requireAuthenticatedToken();
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({
    establishmentId: requestedEstablishmentId,
  });
  const id = requestedEstablishmentId ?? workspace.activeEstablishmentId;
  const item = getWorkspaceEstablishment(workspace, id);
  const isOrganizationOwner = workspace.accountType === "OWNER";
  const hasPermission = isOrganizationOwner || hasEstablishmentPermission(item, permission);
  if (!id || !item || !hasPermission) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }
  return { token, organizationId: workspace.organization?.id, establishmentId: id };
}

export const requireOperationAuthorization = requireCatalogContext;

export async function requireCatalogContext(
  permission = "catalog:manage",
  establishmentId?: string,
) {
  const result = await context(permission, establishmentId);
  if (
    establishmentId !== undefined &&
    (!idSchema.safeParse(establishmentId).success || result.establishmentId !== establishmentId)
  ) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }
  return result;
}

export async function requireCatalogServiceTargetAuthorization(
  id: string,
  permission = "catalog:manage",
  requestedEstablishmentId?: string,
) {
  if (!idSchema.safeParse(id).success) throw new OperationAuthorizationError("INVALID_RESOURCE");
  const result = await context(permission, requestedEstablishmentId);
  const service = await composeCatalogAdapters(result.organizationId).serviceQueryService.getById(
    id,
    result.establishmentId,
    result.token,
  );
  if (!service || service.establishmentId !== result.establishmentId) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }
  return result;
}

/**
 * Target-aware category authorization. The old implementation scanned every
 * page until it found an id. The provider lookup is now one bounded request
 * for the target id; the backend remains authoritative for access.
 */
export async function requireCatalogCategoryTargetAuthorization(
  id: string,
  requestedEstablishmentId?: string,
) {
  if (!idSchema.safeParse(id).success) throw new OperationAuthorizationError("INVALID_RESOURCE");
  const result = await context("catalog:manage", requestedEstablishmentId);
  const category = await composeCatalogAdapters(result.organizationId).categoryQueryService.getById(
    id,
    result.establishmentId,
    result.token,
  );
  if (!category || category.establishmentId !== result.establishmentId) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }
  return result;
}
