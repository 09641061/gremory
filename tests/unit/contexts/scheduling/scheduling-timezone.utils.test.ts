import { describe, expect, it } from "vitest";
import {
  getCalendarWeekRange,
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
});
