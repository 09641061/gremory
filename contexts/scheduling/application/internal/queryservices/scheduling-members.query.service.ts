import "server-only";

import { SchedulingApiGateway } from "@/contexts/scheduling/infrastructure/gateways/scheduling-api.gateway";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import type { SchedulingMemberViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingMembers(
  establishmentId: string
): Promise<SchedulingMemberViewModel[]> {
  try {
    const employees = await new SchedulingApiGateway().getSchedulingEmployees(establishmentId);
    const roster = await createTeamQueryService()
      .list({ establishmentId, status: "ACTIVE", page: 0, size: 100 })
      .catch(() => null);

    return employees.filter((employee) => {
      const member = roster?.content.find((candidate) => candidate.userId === employee.userId);
      if (!member || member.isOwner) return true;

      const roles = member.roles ?? [];
      const permissions = roles.flatMap((role) => role.permissions);
      if (permissions.length === 0) return false;

      return permissions.includes("scheduling:read") || permissions.includes("scheduling:manage");
    }).map((employee) => ({
      id: employee.userId,
      userId: employee.userId,
      name: employee.name,
      email: "",
      role: "",
      status: "ACTIVE",
      imageUrl: employee.imageUrl,
    }));
  } catch (error) {
    console.error("Failed to load scheduling employees:", error);
    return [];
  }
}
