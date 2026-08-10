import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import type { Appointment } from "../../../domain/model/entities/appointment";
import { formatClockRange } from "../scheduling-datetime";

export function findAppointmentService(
  services: SchedulingServiceViewModel[],
  appointment: Appointment
) {
  return services.find((service) => service.id === appointment.serviceId);
}

export function findAppointmentCustomer(
  customers: SchedulingCustomerViewModel[],
  appointment: Appointment
) {
  return customers.find((customer) => customer.id === appointment.customerId);
}

export function findAppointmentEmployee(
  members: SchedulingMemberViewModel[],
  appointment: Appointment
) {
  return members.find((member) => member.userId === appointment.employeeId);
}

export function formatAppointmentDate(startsAt: string) {
  return new Date(startsAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatAppointmentTime(startsAt: string, endsAt: string) {
  return formatClockRange(new Date(startsAt), new Date(endsAt));
}

/**
 * Badge styling per status.
 *
 * Every status gets a distinct treatment: a badge that looks identical for
 * Confirmed, In Progress and Completed carries no information.
 */
export function getAppointmentStatusClasses(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "border-primary/30 bg-primary/10 text-primary";
    case "IN_PROGRESS":
      return "border-primary bg-primary text-primary-foreground";
    case "COMPLETED":
      return "border-primary/25 bg-transparent text-primary/80";
    case "CANCELLED":
      return "border-destructive/20 bg-destructive/10 text-destructive";
    case "NO_SHOW":
      return "border-muted-foreground/30 bg-muted text-muted-foreground";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

export function getAppointmentStatusLabel(status: string) {
  switch (status) {
    case "CANCELLED":
      return "Cancelled";
    case "CONFIRMED":
      return "Confirmed";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "NO_SHOW":
      return "No Show";
    default:
      return status;
  }
}
