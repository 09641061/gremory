import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";

export type DropdownOption = Readonly<{
  value: string;
  label: string;
  description?: string;
}>;

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

function toLocalISOString(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? "+" : "-";
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    dif +
    pad(Math.floor(Math.abs(tzo) / 60)) +
    ":" +
    pad(Math.abs(tzo) % 60)
  );
}

export function computeAppointmentTimes({
  startDate,
  startTime,
  durationMinutes,
}: {
  startDate: string;
  startTime: string;
  durationMinutes: number | null | undefined;
}) {
  if (!startDate || !startTime || !durationMinutes) {
    return { startsAt: "", endsAt: "", formattedEnd: "" };
  }

  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [startHour, startMin] = startTime.split(":").map(Number);
  const startDateTime = new Date(startYear!, startMonth! - 1, startDay!, startHour!, startMin!, 0, 0);
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

  return {
    startsAt: toLocalISOString(startDateTime),
    endsAt: toLocalISOString(endDateTime),
    formattedEnd: `${endDateTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })} (${durationMinutes} mins duration)`,
  };
}
