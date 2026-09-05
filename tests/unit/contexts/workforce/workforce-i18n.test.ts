import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getWorkforceDictionary,
} from "@/contexts/workforce/interfaces/i18n";

describe("Workforce i18n translations", () => {
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
    expect(en.team.title).toBe("Team");
    expect(es.team.title).toBe("Equipo");
    expect(en.permissions.title).toBe("Permissions");
    expect(es.permissions.title).toBe("Permisos");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getWorkforceDictionary("es")).toBe(es);
    expect(getWorkforceDictionary("en")).toBe(en);
    expect(getWorkforceDictionary(null)).toBe(en);
  });
});
