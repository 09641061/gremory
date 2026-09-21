import "server-only";

import { apiConfig } from "@/api.config";
import { businessGet } from "../http/business-api.client";
import { requireBusinessAccessToken } from "../session/business-session";
import {
  businessWorkspaceResourceSchema,
  type BusinessWorkspaceResource,
} from "../../interfaces/rest/schemas/business-workspace.schemas";
import type { BusinessWorkspaceSelection } from "../../application/model/workspace-selection";
import type {
  BusinessWorkspaceReader,
} from "../../application/ports/business-workspace-reader";
import type { WorkspaceHeaderViewModel } from "../../application/model/business-workspace.view-models";
import { toHeaderViewModel } from "../mappers/workspace-header.mapper";

export type { BusinessWorkspaceSelection } from "../../application/model/workspace-selection";

export class BusinessWorkspaceApiGateway implements BusinessWorkspaceReader {
  constructor(private readonly providedToken?: string) {}

  async fetchResource(selection: BusinessWorkspaceSelection = {}): Promise<BusinessWorkspaceResource> {
    const parsed = await this.getWorkspace(selection);
    return parsed as unknown as BusinessWorkspaceResource;
  }

  async getHeaderViewModel(
    selection: BusinessWorkspaceSelection = {},
  ): Promise<WorkspaceHeaderViewModel> {
    return toHeaderViewModel(await this.fetchResource(selection), selection.establishmentId);
  }

  async getSelection(): Promise<BusinessWorkspaceSelection> {
    // The cookie-based selection belongs to the request scope and is set
    // by the workspace-selection server-only module. This gateway does
    // not own cookie state and returns an empty selection by default.
    return {};
  }

  async getWorkspace(selection: BusinessWorkspaceSelection = {}): Promise<BusinessWorkspaceResource> {
    // An explicit token is used as given: the Proxy runs before the request
    // scope exists, so cookie-based resolution is not available there.
    const token = await requireBusinessAccessToken(this.providedToken);
    const params = new URLSearchParams();

    if (selection.organizationId) params.set("organizationId", selection.organizationId);
    if (selection.establishmentId) params.set("establishmentId", selection.establishmentId);

    const path = params.size
      ? `${apiConfig.routes.workspace}?${params.toString()}`
      : apiConfig.routes.workspace;
    const resource = await businessGet<unknown>(path, token);
    return businessWorkspaceResourceSchema.parse(resource) as unknown as BusinessWorkspaceResource;
  }
}
