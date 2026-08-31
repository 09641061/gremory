import "server-only";

import { apiConfig } from "@/api.config";
import { businessGet } from "../http/business-api.client";
import { requireBusinessAccessToken } from "../session/business-session";
import {
  businessWorkspaceResourceSchema,
  type BusinessWorkspaceResource,
} from "../../interfaces/rest/schemas/business-workspace.schemas";

export type BusinessWorkspaceSelection = Readonly<{
  organizationId?: string;
  establishmentId?: string;
}>;

export class BusinessWorkspaceApiGateway {
  constructor(private readonly providedToken?: string) {}

  async getWorkspace(selection: BusinessWorkspaceSelection = {}): Promise<BusinessWorkspaceResource> {
    // An explicit token is used as given: the Proxy runs before the request
    // scope exists, so cookie-based resolution is not available there.
    const token = this.providedToken ?? (await requireBusinessAccessToken());
    const params = new URLSearchParams();

    if (selection.organizationId) params.set("organizationId", selection.organizationId);
    if (selection.establishmentId) params.set("establishmentId", selection.establishmentId);

    const path = params.size
      ? `${apiConfig.routes.workspace}?${params.toString()}`
      : apiConfig.routes.workspace;
    const resource = await businessGet<unknown>(path, token);
    return businessWorkspaceResourceSchema.parse(resource);
  }
}
