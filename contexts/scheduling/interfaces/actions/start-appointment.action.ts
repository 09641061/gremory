"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "./action-state";
import { createSchedulingCommandService } from "../../application/internal/commandservices/scheduling-command.service.impl";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

export async function startAppointmentAction(
  appointmentId: string
): Promise<ActionState<Appointment>> {
  try {
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();
    const commandService = createSchedulingCommandService(workspace.organization?.id);
    const result = await commandService.startAppointment(appointmentId);
    revalidatePath("/schedule");
    return { status: "success", data: result, error: null, fieldErrors: null };
  } catch (error: unknown) {
    console.error("Start appointment action failed:", error);
    let message = "We could not start this appointment. Please try again.";
    if (error instanceof ApiError && error.message) {
      message = error.message;
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
