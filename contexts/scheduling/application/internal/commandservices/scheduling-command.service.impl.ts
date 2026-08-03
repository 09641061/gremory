import "server-only";

import { SchedulingApiGateway } from "@/contexts/scheduling/infrastructure/gateways/scheduling-api.gateway";
import { Appointment } from "../../../domain/model/entities/appointment";
import { CreateAppointmentCommand } from "../../../domain/model/commands/create-appointment.command";
import { RescheduleAppointmentCommand } from "../../../domain/model/commands/reschedule-appointment.command";
import { CancelAppointmentCommand } from "../../../domain/model/commands/cancel-appointment.command";
import { SchedulingCommandService } from "../../services/scheduling-command.service";

type UpdateAppointmentCommand = {
  title: string;
  serviceId: string;
  customerId: string;
  employeeId: string;
  startsAt: string;
  endsAt: string;
};

export class SchedulingCommandServiceImpl implements SchedulingCommandService {
  private readonly gateway = new SchedulingApiGateway();

  createAppointment(command: CreateAppointmentCommand, token?: string): Promise<Appointment> {
    return this.gateway.createAppointment(command, token);
  }

  rescheduleAppointment(
    id: string,
    command: RescheduleAppointmentCommand,
    token?: string
  ): Promise<Appointment> {
    return this.gateway.rescheduleAppointment(id, command, token);
  }

  updateAppointment(
    id: string,
    command: UpdateAppointmentCommand,
    token?: string
  ): Promise<Appointment> {
    return this.gateway.updateAppointment(id, command, token);
  }

  cancelAppointment(
    id: string,
    command: CancelAppointmentCommand,
    token?: string
  ): Promise<Appointment> {
    return this.gateway.cancelAppointment(id, command, token);
  }

  deleteAppointment(id: string, token?: string): Promise<void> {
    return this.gateway.deleteAppointment(id, token);
  }
}

export function createSchedulingCommandService() {
  return new SchedulingCommandServiceImpl();
}
