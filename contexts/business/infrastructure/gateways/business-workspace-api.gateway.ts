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
    const token = await requireBusinessAccessToken(this.providedToken);
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
