"use server";

import { revalidatePath } from "next/cache";
import { createAppointmentSchema } from "../rest/schemas/appointment.schemas";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { Appointment } from "../../domain/model/entities/appointment";
import { createSchedulingCommandService } from "../../application/internal/commandservices/scheduling-command.service.impl";
import { ActionState } from "./action-state";

export { type ActionState };

export async function createAppointmentAction(
  _prevState: ActionState<Appointment>,
  formData: FormData
): Promise<ActionState<Appointment>> {
  const rawData = {
    title: formData.get("title"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    serviceId: formData.get("serviceId"),
    customerId: formData.get("customerId"),
    employeeId: formData.get("employeeId"),
    establishmentId: formData.get("establishmentId"),
  };

  const parsed = createAppointmentSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      status: "error",
      data: null,
      error: "Please fix the validation errors below.",
      errorId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const commandService = createSchedulingCommandService();
    const result = await commandService.createAppointment(parsed.data);
    revalidatePath("/schedule");
    return { status: "success", data: result, error: null, fieldErrors: null };
  } catch (error: unknown) {
    console.error("Create appointment action failed:", error);
    let message = "We could not schedule this appointment. Please try again.";
    if (error instanceof ApiError) {
      if (error.status === 409) {
        message =
          error.message ||
          "There is a scheduling conflict at this time. Please choose another slot or check employee availability.";
      } else if (error.message) {
        message = error.message;
      }
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
