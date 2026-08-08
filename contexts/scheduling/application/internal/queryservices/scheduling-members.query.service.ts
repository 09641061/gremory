import "server-only";

import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import type { SchedulingMemberViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingMembers(
  establishmentId: string
): Promise<SchedulingMemberViewModel[]> {
  try {
    const teamQueryService = createTeamQueryService();
    const membersPage = await teamQueryService.list({ establishmentId, size: 100 });

    return membersPage.content.map((user) => ({
      id: user.memberId ?? "",
      userId: user.userId ?? "",
      name: user.email.split("@")[0] || "Employee",
      email: user.email,
      role: user.roleName,
      status: user.status,
    }));
  } catch (error) {
    console.error("Failed to load team members for scheduler:", error);
    return [];
  }
}
