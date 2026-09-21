"use server";

import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import { revalidatePath } from "next/cache";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "./action-state";
import { requireAppointmentOperationAuthorization } from "@/contexts/scheduling/interfaces/authorization/scheduling-authorization";
import { createSchedulingCommandService } from "../../application/internal/commandservices/scheduling-command.service.impl";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

export async function markNoShowAppointmentAction(
  appointmentId: string
): Promise<ActionState<Appointment>> {
  try {
    await requireAppointmentOperationAuthorization(appointmentId);
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();
    const commandService = createSchedulingCommandService(workspace.organization?.id);
    const result = await commandService.markNoShowAppointment(appointmentId);
    revalidatePath("/schedule");
    return { status: "success", data: result, error: null, errorId: null, fieldErrors: null };
  } catch (error: unknown) {
    console.error("Mark no-show appointment action failed:", error);
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
