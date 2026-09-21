"use server";

import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { Appointment } from "../../domain/model/entities/appointment";
import { PageResponse } from "../../application/model/page-response";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { composeSchedulingAdapters } from "../server/scheduling-composition";
import { requireSchedulingContext } from "../authorization/scheduling-authorization";
import { AppointmentStatusType } from "../../domain/model/valueobjects/appointment-status";

export async function listAppointmentsAction(
  from: string,
  to: string,
  establishmentId?: string,
  employeeId?: string,
  status?: AppointmentStatusType,
  page = 0,
  size = 100
): Promise<PageResponse<Appointment> | { status: "forbidden" | "not-found" | "error"; message: string }> {
  try {
    const auth = await requireSchedulingContext("scheduling:read", establishmentId);
    const queryService = composeSchedulingAdapters(auth.organizationId).queryService;
    return await queryService.searchAppointments({
      from,
      to,
      establishmentId: auth.establishmentId,
      employeeId,
      status,
      page,
      size,
    }, auth.token);
  } catch (error) {
    recordSafely("scheduling.list.appointments.action", { cause: error });
    const safe = safePublicError(error, "Unable to load appointments.");
    const status = safe.status === 403 ? "forbidden" : safe.status === 404 ? "not-found" : "error";
    return { status, message: safe.message };
  }
}
