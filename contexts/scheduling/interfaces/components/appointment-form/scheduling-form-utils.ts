import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import {
  formatInstantAsZonedIso,
  formatTimeInTimeZone,
  zonedDateTimeToIso,
} from "../scheduling-timezone.utils";
import type { DropdownOption } from "./types";

function formatTimeLabel(hours: number, minutes: number) {
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${normalizedHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatTimeSlotValue(slot: string) {
  const [hours, minutes] = slot.split(":").map(Number);
  return formatTimeLabel(hours, minutes);
}

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

export function createTimeOptions(slots: string[]): DropdownOption[] {
  return slots.map((slot) => ({
    value: slot,
    label: formatTimeSlotValue(slot),
  }));
}

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
}) {
  if (!startDate || !startTime || !durationMinutes) {
    return { startsAt: "", endsAt: "", formattedEnd: "" };
  }

  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [startHour, startMin] = startTime.split(":").map(Number);
  const startDateString = `${startYear}-${String(startMonth).padStart(2, "0")}-${String(startDay).padStart(2, "0")}`;
  const startTimeString = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}:00`;
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
