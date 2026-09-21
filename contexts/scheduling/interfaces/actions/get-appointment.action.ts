"use server";

import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { Appointment } from "../../domain/model/entities/appointment";
import { composeSchedulingAdapters } from "../server/scheduling-composition";
import { requireAppointmentOperationAuthorization } from "../authorization/scheduling-authorization";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";

export type GetAppointmentResult =
  | Appointment
  | { status: "forbidden" | "not-found" | "error"; message: string };

export async function getAppointmentAction(id: string): Promise<GetAppointmentResult> {
  try {
    const auth = await requireAppointmentOperationAuthorization(id, "scheduling:read");
    const queryService = composeSchedulingAdapters(auth.organizationId).queryService;
    return await queryService.getAppointment(id, auth.token);
  } catch (error) {
    recordSafely("scheduling.get.appointment.action", { cause: error });
    const safe = safePublicError(error, "Unable to load appointment.");
    const status = safe.status === 403 ? "forbidden" : safe.status === 404 ? "not-found" : "error";
    return { status, message: safe.message };
  }
}
