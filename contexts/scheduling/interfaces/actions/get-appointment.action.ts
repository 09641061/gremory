"use server";

import { Appointment } from "../../domain/model/entities/appointment";
import { createSchedulingQueryService } from "../../application/internal/queryservices/scheduling-query.service.impl";
import { requireAppointmentOperationAuthorization } from "../authorization/scheduling-authorization";

export async function getAppointmentAction(
  id: string
): Promise<Appointment | null> {
  try {
    const auth = await requireAppointmentOperationAuthorization(id, "scheduling:read");
    const queryService = createSchedulingQueryService(auth.organizationId);
    return await queryService.getAppointment(id, auth.token);
  } catch (error) {
    console.error("Get appointment action failed:", error);
    return null;
  }
}
