"use server";

import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import { revalidatePath } from "next/cache";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { ActionState } from "./action-state";
import { requireAppointmentOperationAuthorization } from "@/contexts/scheduling/interfaces/authorization/scheduling-authorization";
import { createSchedulingCommandService } from "../../application/internal/commandservices/scheduling-command.service.impl";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

export async function deleteAppointmentAction(
  appointmentId: string
): Promise<ActionState<void>> {
  try {
    await requireAppointmentOperationAuthorization(appointmentId);
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();
    const commandService = createSchedulingCommandService(workspace.organization?.id);
    await commandService.deleteAppointment(appointmentId);
    revalidatePath("/schedule");
    return { status: "success", data: undefined, error: null, errorId: null, fieldErrors: null };
  } catch (error: unknown) {
    console.error("Delete appointment action failed:", error);
    const message = safePublicError(error, "We could not delete this appointment. Please try again.").message;
    return {
      status: "error",
      data: null,
      error: message,
      errorId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fieldErrors: null,
    };
  }
}
