import "server-only";

import { requireIamAccessToken } from "@/contexts/iam/infrastructure/session/iam-access-token";
import { requireOperationAuthorization } from "@/contexts/catalog/interfaces/authorization/catalog-authorization";

export async function requireCatalogAccessToken(): Promise<string> {
  return requireIamAccessToken();
}

export async function requireCatalogOrganizationId(establishmentId?: string): Promise<string> {
  const context = await requireOperationAuthorization("catalog:manage", establishmentId);
  if (!context.organizationId) throw new Error("An active organization is required");
  return context.organizationId;
}
