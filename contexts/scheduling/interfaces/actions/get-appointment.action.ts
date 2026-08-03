"use server";

import { Appointment } from "../../domain/model/entities/appointment";
import { createSchedulingQueryService } from "../../application/internal/queryservices/scheduling-query.service.impl";

export async function getAppointmentAction(
  id: string
): Promise<Appointment | null> {
  try {
    const queryService = createSchedulingQueryService();
    return await queryService.getAppointment(id);
  } catch (error) {
    console.error("Get appointment action failed:", error);
    return null;
  }
}
