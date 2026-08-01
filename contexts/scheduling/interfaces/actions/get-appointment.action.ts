"use server";

import { SchedulingApiGateway } from "../../infrastructure/gateways/scheduling-api.gateway";
import { Appointment } from "../../domain/model/entities/appointment";

export async function getAppointmentAction(
  id: string
): Promise<Appointment | null> {
  try {
    const gateway = new SchedulingApiGateway();
    return await gateway.getAppointment(id);
  } catch (error) {
    console.error("Get appointment action failed:", error);
    return null;
  }
}
