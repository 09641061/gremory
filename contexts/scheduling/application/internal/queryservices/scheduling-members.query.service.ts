import "server-only";

import { SchedulingApiGateway } from "../../../infrastructure/gateways/scheduling-api.gateway";
import type { SchedulingMemberViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingMembers(
  establishmentId: string
): Promise<SchedulingMemberViewModel[]> {
  try {
    const gateway = new SchedulingApiGateway();
    const employees = await gateway.getSchedulingEmployees(establishmentId);
    return employees.map((emp) => ({
      id: emp.userId,
      userId: emp.userId,
      name: emp.name || "Employee",
      email: "", 
      role: "",
      status: "ACTIVE",
      imageUrl: emp.imageUrl,
    }));
  } catch (error) {
    console.error("Failed to load scheduling employees:", error);
    return [];
  }
}
