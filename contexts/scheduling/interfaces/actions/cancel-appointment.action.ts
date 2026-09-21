"use server";

import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import { revalidatePath } from "next/cache";
import { cancelAppointmentSchema } from "../rest/schemas/appointment.schemas";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "./action-state";
import { requireAppointmentOperationAuthorization } from "@/contexts/scheduling/interfaces/authorization/scheduling-authorization";
import { composeSchedulingAdapters } from "../server/scheduling-composition";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";

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
    await requireAppointmentOperationAuthorization(appointmentId);
    const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel();
    const commandService = composeSchedulingAdapters(workspace.organization?.id).commandService;
    const result = await commandService.cancelAppointment(appointmentId, parsed.data);
    revalidatePath("/schedule");
    return { status: "success", data: result, error: null, errorId: null, fieldErrors: null };
  } catch (error: unknown) {
    recordSafely("scheduling.cancel.appointment.action", { cause: error });
    const message = safePublicError(error, "We could not cancel this appointment. Please try again.").message;
    return {
      status: "error",
      data: null,
      error: message,
      errorId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fieldErrors: null,
    };
  }
}
