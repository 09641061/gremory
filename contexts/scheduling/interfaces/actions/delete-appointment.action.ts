"use server";

import { revalidatePath } from "next/cache";
import { SchedulingApiGateway } from "../../infrastructure/gateways/scheduling-api.gateway";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { ActionState } from "./create-appointment.action";

export async function deleteAppointmentAction(
  appointmentId: string
): Promise<ActionState<void>> {
  try {
    const gateway = new SchedulingApiGateway();
    await gateway.deleteAppointment(appointmentId);
    revalidatePath("/schedule");
    return { status: "success", data: undefined, error: null, fieldErrors: null };
  } catch (error: unknown) {
    console.error("Delete appointment action failed:", error);
    let message = "We could not delete this appointment. Please try again.";
    if (error instanceof ApiError && error.message) {
      message = error.message;
    }
    return { status: "error", data: null, error: message, fieldErrors: null };
  }
}
