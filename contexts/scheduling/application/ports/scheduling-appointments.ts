import type { CancelAppointmentCommand } from "../../domain/model/commands/cancel-appointment.command";
import type { CreateAppointmentCommand } from "../../domain/model/commands/create-appointment.command";
import type { RescheduleAppointmentCommand } from "../../domain/model/commands/reschedule-appointment.command";
import type { UpdateAppointmentCommand } from "../../domain/model/commands/update-appointment.command";
import type { Appointment } from "../../domain/model/entities/appointment";
import type { SearchAppointmentsQuery } from "../../domain/model/queries/search-appointments.query";
import type { PageResponse } from "../model/page-response";

export interface SchedulingAppointmentsReader {
  getAppointment(id: string, token?: string): Promise<Appointment>;
  searchAppointments(query: SearchAppointmentsQuery, token?: string): Promise<PageResponse<Appointment>>;
}

export interface SchedulingAppointmentsWriter {
  createAppointment(command: CreateAppointmentCommand, token?: string): Promise<Appointment>;
  rescheduleAppointment(id: string, command: RescheduleAppointmentCommand, token?: string): Promise<Appointment>;
  updateAppointment(id: string, command: UpdateAppointmentCommand, token?: string): Promise<Appointment>;
  cancelAppointment(id: string, command: CancelAppointmentCommand, token?: string): Promise<Appointment>;
  completeAppointment(id: string, token?: string): Promise<Appointment>;
  startAppointment(id: string, token?: string): Promise<Appointment>;
  markNoShowAppointment(id: string, token?: string): Promise<Appointment>;
  deleteAppointment(id: string, token?: string): Promise<void>;
}
