import type { BusinessWorkspaceSelection } from "../../infrastructure/gateways/business-workspace-api.gateway";
import type { WorkspaceHeaderViewModel } from "../model/business-workspace.view-models";

export interface BusinessWorkspaceQuery {
  establishmentId?: string;
}

/**
 * Server-only reader for the authenticated workspace snapshot. Implementation
 * lives in Infrastructure and is injected through composition. The
 * `BusinessWorkspaceSelection` type is borrowed from the gateway contract
 * until the existing fields are folded into a consumer-owned view model.
 */
export interface BusinessWorkspaceReader {
  getHeaderViewModel(query?: BusinessWorkspaceQuery): Promise<WorkspaceHeaderViewModel>;
  getSelection(): Promise<BusinessWorkspaceSelection>;
}
