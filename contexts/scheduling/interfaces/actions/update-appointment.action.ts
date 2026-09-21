"use server";



import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { revalidatePath } from "next/cache";
import { updateAppointmentSchema } from "../rest/schemas/appointment.schemas";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "./action-state";
import { requireAppointmentOperationAuthorization } from "@/contexts/scheduling/interfaces/authorization/scheduling-authorization";
import { composeSchedulingAdapters } from "../server/scheduling-composition";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";

export async function updateAppointmentAction(
  appointmentId: string,
  _prevState: ActionState<Appointment>,
  formData: FormData
): Promise<ActionState<Appointment>> {
  const rawData = {
    title: formData.get("title"),
    serviceId: formData.get("serviceId"),
    customerId: formData.get("customerId"),
    employeeId: formData.get("employeeId"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  };

  const parsed = updateAppointmentSchema.safeParse(rawData);

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
    await requireAppointmentOperationAuthorization(appointmentId);
    const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel();
    const commandService = composeSchedulingAdapters(workspace.organization?.id).commandService;
    const result = await commandService.updateAppointment(appointmentId, parsed.data);
    revalidatePath("/schedule");
    return { status: "success", data: result, error: null, errorId: null, fieldErrors: null };
  } catch (error: unknown) {
    recordSafely("scheduling.update.appointment.action", { cause: error });
    let message = "We could not update this appointment. Please try again.";
    if (error instanceof ApiError) {
      if (error.status === 409) {
        message = "There is a scheduling conflict at this time. Please choose another slot or check employee availability.";
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
