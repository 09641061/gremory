"use server";

import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { TeamUserSummary } from "@/contexts/workforce/application/model/team.read-models";

export async function getMembersAction(establishmentId: string): Promise<TeamUserSummary[]> {
  try {
    const service = createTeamQueryService();
    const result = await service.list({ establishmentId, size: 100 });
    return result.content;
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return [];
  }
}
