import "server-only";

import { requireIamAccessToken } from "@/contexts/iam/infrastructure/session/iam-access-token";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

export async function requireCatalogAccessToken(): Promise<string> {
  return requireIamAccessToken();
}

export async function requireCatalogOrganizationId(establishmentId?: string): Promise<string> {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({ establishmentId });
  if (!workspace.organization) {
    throw new Error("An active organization is required");
  }
  return workspace.organization.id;
}
