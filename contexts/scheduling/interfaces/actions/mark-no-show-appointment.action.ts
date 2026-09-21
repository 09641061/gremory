"use server";

import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import { revalidatePath } from "next/cache";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "./action-state";
import { requireAppointmentOperationAuthorization } from "@/contexts/scheduling/interfaces/authorization/scheduling-authorization";
import { composeSchedulingAdapters } from "../server/scheduling-composition";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";

export async function markNoShowAppointmentAction(
  appointmentId: string
): Promise<ActionState<Appointment>> {
  try {
    await requireAppointmentOperationAuthorization(appointmentId);
    const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel();
    const commandService = composeSchedulingAdapters(workspace.organization?.id).commandService;
    const result = await commandService.markNoShowAppointment(appointmentId);
    revalidatePath("/schedule");
    return { status: "success", data: result, error: null, errorId: null, fieldErrors: null };
  } catch (error: unknown) {
    recordSafely("scheduling.mark.no.show.appointment.action", { cause: error });
    const message = safePublicError(error, "We could not mark this appointment as no-show. Please try again.").message;
    return {
      status: "error",
      data: null,
      error: message,
      errorId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fieldErrors: null,
    };
  }
}
