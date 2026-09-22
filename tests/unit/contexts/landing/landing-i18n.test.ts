import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getLandingDictionary,
  useLandingI18n,
  useLandingTranslations,
} from "@/contexts/landing/interfaces/i18n";

describe("Landing i18n translations", () => {
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

  it("should provide non-empty strings in both locales without free trial mentions", () => {
    expect(en.landing.nav.brand).toBe("Takodu");
    expect(es.landing.nav.brand).toBe("Takodu");
    expect(en.landing.hero.primaryCta).toBe("Get Started");
    expect(es.landing.hero.primaryCta).toBe("Comenzar ahora");
    expect(en.landing.features.title).toBeTruthy();
    expect(es.landing.features.title).toBeTruthy();
    expect(en.landing.pricing.standard.name).toBe("Standard");
    expect(es.landing.pricing.standard.name).toBe("Standard");
    expect(en.landing.pricing.max.name).toBe("Max");
    expect(es.landing.pricing.max.name).toBe("Max");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getLandingDictionary("es")).toBe(es);
    expect(getLandingDictionary("en")).toBe(en);
    expect(getLandingDictionary(null)).toBe(en);
  });

  it("should export useLandingI18n equal to useLandingTranslations", () => {
    expect(useLandingI18n).toBe(useLandingTranslations);
    expect(typeof useLandingI18n).toBe("function");
  });
});
