import type { SchedulingRosterReader } from "../../ports/scheduling-roster";
import type { SchedulingMemberViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingMembers(
  reader: SchedulingRosterReader,
  establishmentId: string,
  token?: string,
  includeHidden = false,
): Promise<SchedulingMemberViewModel[]> {
  const employees = await reader.getSchedulingEmployees(establishmentId, token);
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
