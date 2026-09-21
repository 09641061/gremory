"use server";

import { Appointment } from "../../domain/model/entities/appointment";
import { PageResponse } from "../../application/model/page-response";
import { createSchedulingQueryService } from "../../application/internal/queryservices/scheduling-query.service.impl";
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
): Promise<PageResponse<Appointment>> {
  try {
    const auth = await requireSchedulingContext("scheduling:read", establishmentId);
    const queryService = createSchedulingQueryService(auth.organizationId);
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
    console.error("List appointments action failed:", error);
    return {
      content: [],
      page: 0,
      size,
      totalPages: 0,
      totalElements: 0,
    };
  }
}
