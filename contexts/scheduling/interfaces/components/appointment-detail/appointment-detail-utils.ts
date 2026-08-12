import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import type { Appointment } from "../../../domain/model/entities/appointment";
import { formatDateInTimeZone, formatTimeInTimeZone } from "../scheduling-timezone.utils";

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

export function formatAppointmentDate(startsAt: string, timeZone: string) {
  return formatDateInTimeZone(new Date(startsAt), timeZone, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatAppointmentTime(startsAt: string, endsAt: string, timeZone: string) {
  return `${formatTimeInTimeZone(new Date(startsAt), timeZone)} - ${formatTimeInTimeZone(new Date(endsAt), timeZone)}`;
}

export function getAppointmentStatusClasses(status: string) {
  switch (status) {
    case "CANCELLED":
      return "border-destructive/20 bg-destructive/10 text-destructive";
    case "CONFIRMED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";
    case "IN_PROGRESS":
      return "border-amber-500/20 bg-amber-500/10 text-amber-600";
    case "COMPLETED":
      return "border-blue-500/20 bg-blue-500/10 text-blue-600";
    case "NO_SHOW":
      return "border-gray-400/20 bg-gray-400/10 text-gray-500";
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
