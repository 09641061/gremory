import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getSchedulingDictionary,
  schedulingLocales,
} from "@/contexts/scheduling/interfaces/i18n";

describe("Scheduling i18n translations", () => {
  it("should have matching keys between en and es dictionaries", () => {
    function collectKeys(obj: Record<string, unknown>, prefix = ""): string[] {
      const keys: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === "object" && !Array.isArray(value)) {
          keys.push(...collectKeys(value as Record<string, unknown>, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys.sort();
    }

    expect(collectKeys(es)).toEqual(collectKeys(en));
  });

  it("should provide non-empty strings in both locales", () => {
    expect(en.calendar.today).toBe("Today");
    expect(es.calendar.today).toBe("Hoy");
    expect(en.calendar.scheduleAppointment).toBe("Schedule appointment");
    expect(es.calendar.scheduleAppointment).toBe("Agendar cita");
    expect(en.status.confirmed).toBe("Confirmed");
    expect(es.status.confirmed).toBe("Confirmada");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getSchedulingDictionary("es")).toBe(es);
    expect(getSchedulingDictionary("en")).toBe(en);
    expect(getSchedulingDictionary(null)).toBe(en);
  });
});
