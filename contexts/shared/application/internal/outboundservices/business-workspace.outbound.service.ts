import "server-only";

import { BusinessWorkspaceApiGateway } from "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway";
import { toHeaderViewModel } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

/**
 * ACL towards Business for routing decisions. It exposes the workspace view
 * model only, so routing never reaches into Business transport shapes.
 */
export class BusinessWorkspaceOutboundService {
  async getWorkspace(accessToken: string, establishmentId?: string): Promise<WorkspaceHeaderViewModel> {
    return toHeaderViewModel(
      await new BusinessWorkspaceApiGateway(accessToken).getWorkspace({ establishmentId }),
    );
  }
}

export function createBusinessWorkspaceOutboundService() {
  return new BusinessWorkspaceOutboundService();
}
