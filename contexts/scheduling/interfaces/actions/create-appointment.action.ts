"use server";



import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { revalidatePath } from "next/cache";
import { createAppointmentSchema } from "../rest/schemas/appointment.schemas";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { Appointment } from "../../domain/model/entities/appointment";
import { composeSchedulingAdapters } from "../server/scheduling-composition";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { ActionState } from "./action-state";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";

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

  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({
    establishmentId: parsed.data.establishmentId,
  });
  const establishment = getWorkspaceEstablishment(workspace, parsed.data.establishmentId);
  if (
    !establishment?.canRead ||
    !hasEstablishmentPermission(establishment, "scheduling:manage")
  ) {
    return {
      status: "error",
      data: null,
      error: "You are not authorized to create appointments.",
      errorId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      fieldErrors: null,
    };
  }

  try {
    const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({
      establishmentId: parsed.data.establishmentId,
    });
    const commandService = composeSchedulingAdapters(workspace.organization?.id).commandService;
    const result = await commandService.createAppointment(parsed.data);
    revalidatePath("/schedule");
    return { status: "success", data: result, error: null, errorId: null, fieldErrors: null };
  } catch (error: unknown) {
    recordSafely("scheduling.create.appointment.action", { cause: error });
    let message = "We could not schedule this appointment. Please try again.";
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
