import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getAnalyticsDictionary,
} from "@/contexts/analytics/interfaces/i18n";

describe("Analytics i18n translations", () => {
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
    expect(en.dashboard.title).toBe("Analytics");
    expect(es.dashboard.title).toBe("Analítica");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getAnalyticsDictionary("es")).toBe(es);
    expect(getAnalyticsDictionary("en")).toBe(en);
    expect(getAnalyticsDictionary(null)).toBe(en);
  });
});
