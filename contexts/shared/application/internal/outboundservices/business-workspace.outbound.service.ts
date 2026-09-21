import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import type { BusinessWorkspaceSelection } from "@/contexts/business/application/model/workspace-selection";
import type { BusinessWorkspaceReader } from "@/contexts/business/application/ports/business-workspace-reader";

/**
 * ACL towards Business for routing decisions. It exposes the workspace view
 * model only, so routing never reaches into Business transport shapes. The
 * consumer-owned port is provided by composition; this service is a pure
 * adapter over the workspace reader.
 */
export class BusinessWorkspaceOutboundService {
  constructor(private readonly workspace: BusinessWorkspaceReader) {}

  async getWorkspace(
    _accessToken: string,
    selection: BusinessWorkspaceSelection = {},
  ): Promise<WorkspaceHeaderViewModel> {
    return this.workspace.getHeaderViewModel(selection);
  }
}

export function createBusinessWorkspaceOutboundService(
  workspace: BusinessWorkspaceReader,
): BusinessWorkspaceOutboundService {
  return new BusinessWorkspaceOutboundService(workspace);
}
