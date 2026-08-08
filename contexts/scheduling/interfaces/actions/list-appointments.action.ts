"use server";

import { Appointment } from "../../domain/model/entities/appointment";
import { PageResponse } from "../../application/model/page-response";
import { createSchedulingQueryService } from "../../application/internal/queryservices/scheduling-query.service.impl";
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
    const queryService = createSchedulingQueryService();
    return await queryService.searchAppointments({
      from,
      to,
      establishmentId,
      employeeId,
      status,
      page,
      size,
    });
  } catch (error) {
    console.error("List appointments action failed:", error);
    return {
      content: [],
      pageable: { pageNumber: 0, pageSize: size },
      totalPages: 0,
      totalElements: 0,
      last: true,
    };
  }
}
