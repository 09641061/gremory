"use server";

import { Appointment } from "../../domain/model/entities/appointment";
import { createSchedulingQueryService } from "../../application/internal/queryservices/scheduling-query.service.impl";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

export async function getAppointmentAction(
  id: string
): Promise<Appointment | null> {
  try {
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();
    const queryService = createSchedulingQueryService(workspace.organization?.id);
    return await queryService.getAppointment(id);
  } catch (error) {
    console.error("Get appointment action failed:", error);
    return null;
  }
}
