"use server";

import { revalidatePath } from "next/cache";
import { cancelAppointmentSchema } from "../rest/schemas/appointment.schemas";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "./create-appointment.action";
import { createSchedulingCommandService } from "../../application/internal/commandservices/scheduling-command.service.impl";

export async function cancelAppointmentAction(
  appointmentId: string,
  _prevState: ActionState<Appointment>,
  formData: FormData
): Promise<ActionState<Appointment>> {
  const rawData = {
    reason: formData.get("reason"),
  };

  const parsed = cancelAppointmentSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      status: "error",
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid cancellation reason.",
      errorId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const commandService = createSchedulingCommandService();
    const result = await commandService.cancelAppointment(appointmentId, parsed.data);
    revalidatePath("/schedule");
    return { status: "success", data: result, error: null, fieldErrors: null };
  } catch (error: unknown) {
    console.error("Cancel appointment action failed:", error);
    let message = "We could not cancel this appointment. Please try again.";
    if (error instanceof ApiError && error.message) {
      message = error.message;
    }
    return {
      status: "error",
      data: null,
      error: message,
      errorId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fieldErrors: null,
    };
  }
}
