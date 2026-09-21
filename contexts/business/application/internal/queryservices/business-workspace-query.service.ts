import type {
  OrganizationPageState,
  WorkspaceHeaderViewModel,
} from "@/contexts/business/application/model/business-workspace.view-models";
import type { BusinessWorkspaceResource } from "@/contexts/business/application/model/workspace-resource";
import type { BusinessWorkspaceSelection } from "@/contexts/business/application/model/workspace-selection";
import type { BusinessWorkspaceReader } from "../../ports/business-workspace-reader";

/**
 * Pure query handler. Infrastructure provides a `BusinessWorkspaceReader`
 * that parses the resource and exposes a `getHeaderViewModel` view; this
 * service composes them with the application policies (organization page
 * authorization) and never imports concrete gateways.
 */
export class BusinessWorkspaceQueryService {
  constructor(private readonly workspace: BusinessWorkspaceReader) {}

  async getHeaderViewModel(
    query: BusinessWorkspaceSelection = {},
  ): Promise<WorkspaceHeaderViewModel> {
    return this.workspace.getHeaderViewModel(query);
  }

  async getOrganizationPageState(
    query: BusinessWorkspaceSelection = {},
  ): Promise<OrganizationPageState> {
    const workspace = await this.workspace.getHeaderViewModel(query);

    if (!workspace.organization || !workspace.canReadOrganization) {
      return { status: "denied" };
    }

    return {
      status: "ready",
      organization: workspace.organization,
      canUpdate: workspace.organization.canUpdate === true,
    };
  }

  async fetchResource(query: BusinessWorkspaceSelection): Promise<BusinessWorkspaceResource> {
    return this.workspace.fetchResource(query);
  }
}
