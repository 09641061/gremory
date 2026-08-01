import { Appointment } from "../../domain/model/entities/appointment";
import { CreateAppointmentCommand } from "../../domain/model/commands/create-appointment.command";
import { RescheduleAppointmentCommand } from "../../domain/model/commands/reschedule-appointment.command";
import { CancelAppointmentCommand } from "../../domain/model/commands/cancel-appointment.command";

export interface SchedulingCommandService {
  createAppointment(command: CreateAppointmentCommand, token?: string): Promise<Appointment>;
  rescheduleAppointment(id: string, command: RescheduleAppointmentCommand, token?: string): Promise<Appointment>;
  cancelAppointment(id: string, command: CancelAppointmentCommand, token?: string): Promise<Appointment>;
  deleteAppointment(id: string, token?: string): Promise<void>;
}
