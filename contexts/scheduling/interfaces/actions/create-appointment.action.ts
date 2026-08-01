"use server";

import { revalidatePath } from "next/cache";
import { SchedulingApiGateway } from "../../infrastructure/gateways/scheduling-api.gateway";
import { createAppointmentSchema } from "../rest/schemas/appointment.schemas";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { Appointment } from "../../domain/model/entities/appointment";

export type ActionState<T> =
  | { status: "idle"; data: null; error: null; fieldErrors: null }
  | { status: "success"; data: T; error: null; fieldErrors: null }
  | { status: "error"; data: null; error: string; fieldErrors: Record<string, string[]> | null };

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
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const gateway = new SchedulingApiGateway();
    const result = await gateway.createAppointment(parsed.data);
    revalidatePath("/schedule");
    return { status: "success", data: result, error: null, fieldErrors: null };
  } catch (error: unknown) {
    console.error("Create appointment action failed:", error);
    let message = "We could not schedule this appointment. Please try again.";
    if (error instanceof ApiError) {
      if (error.status === 409) {
        message = "There is a scheduling conflict at this time. Please choose another slot or checking employee availability.";
      } else if (error.message) {
        message = error.message;
      }
    }
    return { status: "error", data: null, error: message, fieldErrors: null };
  }
}
