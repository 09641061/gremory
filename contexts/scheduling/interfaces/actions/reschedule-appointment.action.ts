"use server";

import { revalidatePath } from "next/cache";
import { SchedulingApiGateway } from "../../infrastructure/gateways/scheduling-api.gateway";
import { rescheduleAppointmentSchema } from "../rest/schemas/appointment.schemas";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "./create-appointment.action";

export async function rescheduleAppointmentAction(
  appointmentId: string,
  _prevState: ActionState<Appointment>,
  formData: FormData
): Promise<ActionState<Appointment>> {
  const rawData = {
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    reason: formData.get("reason"),
  };

  const parsed = rescheduleAppointmentSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      status: "error",
      data: null,
      error: "Please fix the validation errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const gateway = new SchedulingApiGateway();
    const result = await gateway.rescheduleAppointment(appointmentId, parsed.data);
    revalidatePath("/schedule");
    return { status: "success", data: result, error: null, fieldErrors: null };
  } catch (error: unknown) {
    console.error("Reschedule appointment action failed:", error);
    let message = "We could not reschedule this appointment. Please try again.";
    if (error instanceof ApiError) {
      if (error.status === 409) {
        message = "There is a scheduling conflict at this time. Please choose another slot or check employee availability.";
      } else if (error.message) {
        message = error.message;
      }
    }
    return { status: "error", data: null, error: message, fieldErrors: null };
  }
}
