"use server";

import { revalidatePath } from "next/cache";
import { rescheduleAppointmentSchema } from "../rest/schemas/appointment.schemas";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "./action-state";
import { createSchedulingCommandService } from "../../application/internal/commandservices/scheduling-command.service.impl";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

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
      errorId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();
    const commandService = createSchedulingCommandService(workspace.organization?.id);
    const result = await commandService.rescheduleAppointment(appointmentId, parsed.data);
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
    return {
      status: "error",
      data: null,
      error: message,
      errorId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fieldErrors: null,
    };
  }
}
