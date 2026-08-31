import "server-only";

import { SchedulingApiGateway } from "@/contexts/scheduling/infrastructure/gateways/scheduling-api.gateway";
import type { SchedulingServiceViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingServices(
  establishmentId: string,
  organizationId: string,
): Promise<SchedulingServiceViewModel[]> {
  try {
    const gateway = new SchedulingApiGateway(organizationId);
    return await gateway.getSchedulingServices(establishmentId);
  } catch (error) {
    console.error("Failed to load services for scheduler:", error);
    return [];
  }
}
