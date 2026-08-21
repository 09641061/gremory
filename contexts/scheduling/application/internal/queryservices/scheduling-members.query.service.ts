import "server-only";

import { SchedulingApiGateway } from "@/contexts/scheduling/infrastructure/gateways/scheduling-api.gateway";
import type { SchedulingMemberViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingMembers(
  establishmentId: string,
  organizationId: string,
  includeHidden = false,
): Promise<SchedulingMemberViewModel[]> {
  const gateway = new SchedulingApiGateway(organizationId);
  const employees = await gateway.getSchedulingEmployees(establishmentId);
  return employees.filter((employee) => includeHidden || employee.visibleForScheduling !== false).map((employee) => ({
    id: employee.userId,
    userId: employee.userId,
    name: employee.name,
    email: "",
    role: "",
    status: employee.availableForScheduling ? "AVAILABLE" : "UNAVAILABLE",
    imageUrl: employee.imageUrl,
    isOwner: employee.isOwner,
    availableForScheduling: employee.availableForScheduling,
    visibleForScheduling: employee.visibleForScheduling,
  }));
}
