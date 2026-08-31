import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import type { DropdownOption } from "./types";
import {
  formatInstantAsZonedIso,
  formatTimeInTimeZone,
  zonedDateTimeToIso,
} from "../scheduling-timezone.utils";

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
    description: member.availableForScheduling ? "Available for appointments" : "Unavailable for appointments",
    disabled: !member.availableForScheduling,
  }));
}

export type AppointmentTimes = Readonly<{
  startsAt: string;
  endsAt: string;
  formattedEnd: string;
}>;

export function computeAppointmentTimes({
  startDate,
  startTime,
  durationMinutes,
  timeZone,
}: {
  startDate: string;
  startTime: string;
  durationMinutes: number | null | undefined;
  timeZone: string;
}): AppointmentTimes {
  if (!startDate || !startTime || !durationMinutes) {
    return { startsAt: "", endsAt: "", formattedEnd: "" };
  }

  const [year, month, day] = startDate.split("-").map(Number);
  const [hour, minute] = startTime.split(":").map(Number);
  const startDateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const startTimeString = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  const startInstant = new Date(
    zonedDateTimeToIso({
      dateString: startDateString,
      timeString: startTimeString,
      timeZone,
    })
  );
  const endInstant = new Date(startInstant.getTime() + durationMinutes * 60 * 1000);

  return {
    startsAt: zonedDateTimeToIso({
      dateString: startDateString,
      timeString: startTimeString,
      timeZone,
    }),
    endsAt: formatInstantAsZonedIso(endInstant, timeZone),
    formattedEnd: `${formatTimeInTimeZone(endInstant, timeZone)} (${durationMinutes} mins duration)`,
  };
}
