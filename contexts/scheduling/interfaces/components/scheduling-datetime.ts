/**
 * Pure date/time transforms shared across the scheduling UI.
 *
 * Interface-layer transforms only: no React, no IO, no domain rules. The
 * backend speaks offset-aware ISO strings, the browser speaks local time, and
 * every conversion between the two lives here so it is written exactly once.
 */

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** Serializes a local `Date` as an offset-aware ISO string the API accepts. */
export function toLocalISOString(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const offset = `${sign}${pad(Math.floor(Math.abs(offsetMinutes) / 60))}:${pad(
    Math.abs(offsetMinutes) % 60
  )}`;

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${offset}`
  );
}

/** `<input type="date">` shape: `YYYY-MM-DD`. */
export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** `<input type="time">` shape: `HH:MM` in 24h. */
export function toTimeInputValue(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parses `YYYY-MM-DD` into a local midnight `Date`, or `null` when malformed. */
export function parseDateInputValue(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/** Calendar day key used to group and compare appointments without time. */
export function toDayKey(date: Date): string {
  return toDateInputValue(date);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatClockRange(start: Date, end: Date): string {
  return `${formatClockTime(start)} - ${formatClockTime(end)}`;
}

/** Sunday-to-Saturday bounds of the week containing `date`. */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
