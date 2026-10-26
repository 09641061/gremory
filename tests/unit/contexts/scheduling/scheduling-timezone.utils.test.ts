import { describe, expect, it } from "vitest";
import {
  getCalendarWeekRange,
  toTimeZoneDateInputValue,
  toTimeZoneTimeInputValue,
  zonedDateTimeToIso,
} from "@/contexts/scheduling/interfaces/components/scheduling-timezone.utils";

describe("scheduling timezone utilities", () => {
  it("keeps the correct offset on both sides of a DST transition", () => {
    expect(
      zonedDateTimeToIso({
        dateString: "2024-03-10",
        timeString: "01:30:00",
        timeZone: "America/New_York",
      }),
    ).toBe("2024-03-10T01:30:00-05:00");
    expect(
      zonedDateTimeToIso({
        dateString: "2024-03-10",
        timeString: "03:30:00",
        timeZone: "America/New_York",
      }),
    ).toBe("2024-03-10T03:30:00-04:00");
  });

  it("builds a complete UTC calendar-day range", () => {
    const { sunday, saturday } = getCalendarWeekRange(new Date("2024-06-12T12:00:00Z"));
    expect(sunday.toISOString()).toBe("2024-06-09T00:00:00.000Z");
    expect(saturday.toISOString()).toBe("2024-06-15T23:59:59.999Z");
  });

  it("formats date and time input values in the specified timezone without local host bias", () => {
    // 17:15 UTC is 12:15 in America/Lima (UTC-5)
    const date = new Date("2026-10-26T17:15:00.000Z");
    expect(toTimeZoneDateInputValue(date, "America/Lima")).toBe("2026-10-26");
    expect(toTimeZoneTimeInputValue(date, "America/Lima")).toBe("12:15");

    // 02:15 UTC on Oct 27 is 21:15 on Oct 26 in America/Lima
    const lateUtcDate = new Date("2026-10-27T02:15:00.000Z");
    expect(toTimeZoneDateInputValue(lateUtcDate, "America/Lima")).toBe("2026-10-26");
    expect(toTimeZoneTimeInputValue(lateUtcDate, "America/Lima")).toBe("21:15");

    // Roundtrip back via zonedDateTimeToIso
    const isoString = zonedDateTimeToIso({
      dateString: toTimeZoneDateInputValue(lateUtcDate, "America/Lima"),
      timeString: `${toTimeZoneTimeInputValue(lateUtcDate, "America/Lima")}:00`,
      timeZone: "America/Lima",
    });
    expect(new Date(isoString).toISOString()).toBe(lateUtcDate.toISOString());
  });
});
