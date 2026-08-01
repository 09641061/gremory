"use server";

import { revalidatePath } from "next/cache";
import { SchedulingApiGateway } from "../../infrastructure/gateways/scheduling-api.gateway";
import { cancelAppointmentSchema } from "../rest/schemas/appointment.schemas";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "./create-appointment.action";

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
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const gateway = new SchedulingApiGateway();
    const result = await gateway.cancelAppointment(appointmentId, parsed.data);
    revalidatePath("/schedule");
    return { status: "success", data: result, error: null, fieldErrors: null };
  } catch (error: unknown) {
    console.error("Cancel appointment action failed:", error);
    let message = "We could not cancel this appointment. Please try again.";
    if (error instanceof ApiError && error.message) {
      message = error.message;
    }
    return { status: "error", data: null, error: message, fieldErrors: null };
  }
}
