import "server-only";

import { WorkforceAccessGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-access.gateway";

export class WorkforceEntryAccessOutboundService {
  async getAccessContext(accessToken: string) {
    return new WorkforceAccessGateway(accessToken).getAccessContext();
  }
}

export function createWorkforceEntryAccessOutboundService() {
  return new WorkforceEntryAccessOutboundService();
}

