import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getDictionary,
  interpolate,
} from "@/contexts/shared/infrastructure/i18n/locales";

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

describe("i18n dictionaries", () => {
  it("should have matching keys between en and es dictionaries", () => {
    const enKeys = collectKeys(en);
    const esKeys = collectKeys(es);

    expect(esKeys).toEqual(enKeys);
  });

  it("should have non-empty string values for all keys in en and es", () => {
    function assertNonEmpty(obj: Record<string, unknown>, path = "") {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === "string") {
          expect(value.trim().length, `Empty string at ${currentPath}`).toBeGreaterThan(0);
        } else if (value && typeof value === "object") {
          assertNonEmpty(value as Record<string, unknown>, currentPath);
        }
      }
    }

    assertNonEmpty(en);
    assertNonEmpty(es);
  });

  it("should return the requested dictionary via getDictionary", () => {
    expect(getDictionary("es")).toBe(es);
    expect(getDictionary("en")).toBe(en);
  });

  it("should interpolate named parameters correctly", () => {
    const template = "Only letters, {min} to {max} characters.";
    const result = interpolate(template, { min: 3, max: 20 });
    expect(result).toBe("Only letters, 3 to 20 characters.");
  });

  it("should handle missing interpolation parameters gracefully", () => {
    const template = "Hello {name}, your code is {code}.";
    const result = interpolate(template, { name: "Alice" });
    expect(result).toBe("Hello Alice, your code is {code}.");
  });

  it("should return unchanged template when no params given", () => {
    const template = "Hello world";
    expect(interpolate(template)).toBe("Hello world");
  });
});
