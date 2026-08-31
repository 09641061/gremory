function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatOffset(minutes: number) {
  const normalized = Math.trunc(minutes);
  const sign = normalized >= 0 ? "+" : "-";
  const absolute = Math.abs(normalized);
  const hours = Math.floor(absolute / 60);
  const mins = absolute % 60;
  return `${sign}${pad(hours)}:${pad(mins)}`;
}

export function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return {
    year: Number(parts.year ?? 0),
    month: Number(parts.month ?? 0),
    day: Number(parts.day ?? 0),
    hour: Number(parts.hour ?? 0),
    minute: Number(parts.minute ?? 0),
    second: Number(parts.second ?? 0),
  };
}

export function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  const zonedUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return Math.round((zonedUtc - date.getTime()) / 60000);
}

export function formatDateInTimeZone(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone,
  }).format(date);
}

export function formatTimeInTimeZone(date: Date, timeZone: string) {
  return formatDateInTimeZone(date, timeZone, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toTimeZoneDayKey(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function getCalendarAnchorDate(timeZone: string, baseDate = new Date()) {
  const parts = getTimeZoneParts(baseDate, timeZone);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0));
}

export function getCalendarWeekRange(date: Date) {
  const current = new Date(date);
  const first = current.getUTCDate() - current.getUTCDay();
  const sunday = new Date(current);
  sunday.setUTCDate(first);
  sunday.setUTCHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setUTCDate(sunday.getUTCDate() + 6);
  saturday.setUTCHours(23, 59, 59, 999);

  return { sunday, saturday };
}

export function addCalendarDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function formatCalendarMonthYear(date: Date, timeZone: string) {
  return formatDateInTimeZone(date, timeZone, {
    month: "long",
    year: "numeric",
  });
}

export function formatCalendarWeekday(date: Date, timeZone: string) {
  return formatDateInTimeZone(date, timeZone, {
    weekday: "short",
  });
}

export function isSameCalendarDate(left: Date, right: Date) {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

export function calendarDateToZonedIso(date: Date, timeZone: string, endOfDay = false) {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const time = endOfDay ? "23:59:59" : "00:00:00";
  return zonedDateTimeToIso({
    dateString: `${year}-${month}-${day}`,
    timeString: time,
    timeZone,
  });
}

export function zonedDateTimeToIso({
  dateString,
  timeString,
  timeZone,
}: {
  dateString: string;
  timeString: string;
  timeZone: string;
}) {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hour = 0, minute = 0, second = 0] = timeString.split(":").map(Number);
  const baseUtc = Date.UTC(year, month - 1, day, hour, minute, second, 0);

  let candidate = new Date(baseUtc);
  let offset = getTimeZoneOffsetMinutes(candidate, timeZone);
  candidate = new Date(baseUtc - offset * 60000);

  const adjustedOffset = getTimeZoneOffsetMinutes(candidate, timeZone);
  if (adjustedOffset !== offset) {
    offset = adjustedOffset;
    candidate = new Date(baseUtc - offset * 60000);
  }

  const parts = getTimeZoneParts(candidate, timeZone);
  return (
    `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T` +
    `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}` +
    formatOffset(offset)
  );
}

export function formatInstantAsZonedIso(date: Date, timeZone: string) {
  const offset = getTimeZoneOffsetMinutes(date, timeZone);
  const parts = getTimeZoneParts(date, timeZone);

  return (
    `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T` +
    `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}` +
    formatOffset(offset)
  );
}
