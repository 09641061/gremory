export type AppointmentTimeValues = {
  startsAt: string;
  endsAt: string;
  formattedEnd: string;
};

export function generateAppointmentTimeSlots(): string[] {
  const slots: string[] = [];

  for (let hour = 7; hour <= 21; hour += 1) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 21 && minute > 0) break;
      slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
  }

  return slots;
}

export function calculateAppointmentTimes(
  startDate: string,
  startTime: string,
  durationMinutes: number,
): AppointmentTimeValues {
  if (!startDate || !startTime) {
    return { startsAt: "", endsAt: "", formattedEnd: "" };
  }

  const [year, month, day] = startDate.split("-").map(Number);
  const [hour, minute] = startTime.split(":").map(Number);
  const starts = new Date(year!, month! - 1, day!, hour!, minute!, 0, 0);
  const ends = new Date(starts.getTime() + durationMinutes * 60 * 1000);

  return {
    startsAt: toLocalISOString(starts),
    endsAt: toLocalISOString(ends),
    formattedEnd: `${ends.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })} (${durationMinutes} mins duration)`,
  };
}

function toLocalISOString(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const timezoneOffset = -date.getTimezoneOffset();
  const sign = timezoneOffset >= 0 ? "+" : "-";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${sign}${pad(
    Math.floor(Math.abs(timezoneOffset) / 60),
  )}:${pad(Math.abs(timezoneOffset) % 60)}`;
}

export function getAppointmentDuration(
  services: ReadonlyArray<{ id: string; durationMinutes: number }>,
  serviceId: string,
): number {
  return services.find((service) => service.id === serviceId)?.durationMinutes ?? 30;
}

export function getAppointmentInitialDateTime(appointment: { startsAt: string }) {
  const date = new Date(appointment.startsAt);
  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`,
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
}
