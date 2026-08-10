import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import { formatClockTime, toLocalISOString } from "../scheduling-datetime";
import type { DropdownOption } from "./types";

export function createServiceOptions(services: SchedulingServiceViewModel[]): DropdownOption[] {
  return services.map((service) => ({
    value: service.id,
    label: service.name,
    description: `$${service.price.toFixed(2)} - ${service.durationMinutes} min`,
  }));
}

export function createCustomerOptions(
  customers: SchedulingCustomerViewModel[]
): DropdownOption[] {
  return customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
    description: customer.email || customer.phone || "Customer",
  }));
}

export function createEmployeeOptions(members: SchedulingMemberViewModel[]): DropdownOption[] {
  return members.map((member) => ({
    value: member.userId,
    label: member.name,
    description: member.role,
  }));
}

export type AppointmentTimes = Readonly<{
  /** Empty until date, time and a service duration are all known. */
  startsAt: string;
  endsAt: string;
  formattedEnd: string;
}>;

/**
 * Derives the submitted `startsAt`/`endsAt` from the picked local date, local
 * time and the selected service's duration.
 */
export function computeAppointmentTimes({
  startDate,
  startTime,
  durationMinutes,
}: {
  startDate: string;
  startTime: string;
  durationMinutes: number | null | undefined;
}): AppointmentTimes {
  if (!startDate || !startTime || !durationMinutes) {
    return { startsAt: "", endsAt: "", formattedEnd: "" };
  }

  const [year, month, day] = startDate.split("-").map(Number);
  const [hour, minute] = startTime.split(":").map(Number);
  const start = new Date(year!, month! - 1, day!, hour!, minute!, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  return {
    startsAt: toLocalISOString(start),
    endsAt: toLocalISOString(end),
    formattedEnd: `${formatClockTime(end)} (${durationMinutes} mins duration)`,
  };
}
