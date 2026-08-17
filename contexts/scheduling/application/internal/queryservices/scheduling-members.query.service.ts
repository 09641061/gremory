import "server-only";

import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import type { SchedulingMemberViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingMembers(
  establishmentId: string
): Promise<SchedulingMemberViewModel[]> {
  try {
    const team = createTeamQueryService();
    const roster = await team.list({
      establishmentId,
      status: "ACTIVE",
      page: 0,
      size: 100,
    });

    return roster.content
      .filter((member) => member.availableForScheduling && member.userId !== null)
      .map((member) => ({
        id: member.userId ?? member.memberId ?? member.email,
        userId: member.userId ?? member.memberId ?? member.email,
        name: member.name || member.email,
        email: member.email,
        role: member.roleName,
        status: member.status,
        imageUrl: member.imageUrl,
      }));
  } catch (error) {
    console.error("Failed to load scheduling employees:", error);
    return [];
  }
}
