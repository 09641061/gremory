import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getBusinessDictionary,
} from "@/contexts/business/interfaces/i18n";

describe("Business i18n translations", () => {
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
    expect(en.establishments.title).toBe("Establishments");
    expect(es.establishments.title).toBe("Establecimientos");
    expect(en.organizations.title).toBe("Organizations");
    expect(es.organizations.title).toBe("Organizaciones");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getBusinessDictionary("es")).toBe(es);
    expect(getBusinessDictionary("en")).toBe(en);
    expect(getBusinessDictionary(null)).toBe(en);
  });
});
