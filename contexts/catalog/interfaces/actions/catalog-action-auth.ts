import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

export async function requireCatalogAccessToken(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    throw new Error("Authentication is required");
  }

  return accessToken;
}

export async function requireCatalogOrganizationId(establishmentId?: string): Promise<string> {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({ establishmentId });
  if (!workspace.organization) {
    throw new Error("An active organization is required");
  }
  return workspace.organization.id;
}
