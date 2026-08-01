import { Appointment } from "../../domain/model/entities/appointment";
import { SearchAppointmentsQuery } from "../../domain/model/queries/search-appointments.query";
import { PageResponse } from "../model/page-response";

export interface SchedulingQueryService {
  getAppointment(id: string, token?: string): Promise<Appointment>;
  searchAppointments(query: SearchAppointmentsQuery, token?: string): Promise<PageResponse<Appointment>>;
}
