"use server";

import { SchedulingApiGateway } from "../../infrastructure/gateways/scheduling-api.gateway";
import { Appointment } from "../../domain/model/entities/appointment";
import { PageResponse } from "../../application/model/page-response";

export async function listAppointmentsAction(
  from: string,
  to: string,
  establishmentId?: string,
  employeeId?: string,
  status?: string,
  page = 0,
  size = 100
): Promise<PageResponse<Appointment>> {
  try {
    const gateway = new SchedulingApiGateway();
    return await gateway.searchAppointments({
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
