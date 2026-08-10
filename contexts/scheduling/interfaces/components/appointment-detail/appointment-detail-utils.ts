import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import type { Appointment } from "../../../domain/model/entities/appointment";

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
  const starts = new Date(startsAt);
  const ends = new Date(endsAt);

  return `${starts.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${ends.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function getAppointmentStatusClasses(status: string) {
  switch (status) {
    case "CANCELLED":
      return "border-destructive/20 bg-destructive/10 text-destructive";
    case "CONFIRMED":
      return "border-primary/20 bg-primary/10 text-primary";
    case "IN_PROGRESS":
      return "border-primary/20 bg-primary/10 text-primary";
    case "COMPLETED":
      return "border-primary/20 bg-primary/10 text-primary";
    case "NO_SHOW":
      return "border-muted bg-muted/40 text-muted-foreground";
    default:
      return "border-primary/20 bg-primary/10 text-primary";
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
