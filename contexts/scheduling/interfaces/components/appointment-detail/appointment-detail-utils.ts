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
  return status === "CANCELLED"
    ? "border-destructive/20 bg-destructive/10 text-destructive"
    : "border-primary/20 bg-primary/10 text-primary";
}
