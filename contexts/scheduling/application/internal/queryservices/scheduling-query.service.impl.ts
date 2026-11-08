import type { SchedulingAppointmentsReader } from "../../ports/scheduling-appointments";
import { Appointment } from "../../../domain/model/entities/appointment";
import { SearchAppointmentsQuery } from "../../../domain/model/queries/search-appointments.query";
import { PageResponse } from "../../model/page-response";
import { SchedulingQueryService } from "../../services/scheduling-query.service";

export class SchedulingQueryServiceImpl implements SchedulingQueryService {
  constructor(private readonly gateway: SchedulingAppointmentsReader) {}

  getAppointment(id: string, token?: string): Promise<Appointment> {
    return this.gateway.getAppointment(id, token);
  }

  searchAppointments(
    query: SearchAppointmentsQuery,
    token?: string
  ): Promise<PageResponse<Appointment>> {
    return this.gateway.searchAppointments(query, token);
  }
}
