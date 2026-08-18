import "server-only";

import { SchedulingApiGateway } from "@/contexts/scheduling/infrastructure/gateways/scheduling-api.gateway";
import { Appointment } from "../../../domain/model/entities/appointment";
import { SearchAppointmentsQuery } from "../../../domain/model/queries/search-appointments.query";
import { PageResponse } from "../../model/page-response";
import { SchedulingQueryService } from "../../services/scheduling-query.service";

export class SchedulingQueryServiceImpl implements SchedulingQueryService {
  private readonly gateway: SchedulingApiGateway;

  constructor(organizationId?: string) {
    this.gateway = new SchedulingApiGateway(organizationId);
  }

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

export function createSchedulingQueryService(organizationId?: string) {
  return new SchedulingQueryServiceImpl(organizationId);
}
