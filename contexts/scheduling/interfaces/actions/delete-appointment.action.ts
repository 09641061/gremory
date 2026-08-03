"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { ActionState } from "./create-appointment.action";
import { createSchedulingCommandService } from "../../application/internal/commandservices/scheduling-command.service.impl";

export async function deleteAppointmentAction(
  appointmentId: string
): Promise<ActionState<void>> {
  try {
    const commandService = createSchedulingCommandService();
    await commandService.deleteAppointment(appointmentId);
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
