import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getBillingDictionary,
} from "@/contexts/billing/interfaces/i18n";

describe("Billing i18n translations", () => {
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
    expect(en.subscribe.heroTitle).toBe("Choose the plan that fits you");
    expect(es.subscribe.heroTitle).toBe("Elige el plan que se adapte a ti");
    expect(en.invoices.title).toBe("Invoices");
    expect(es.invoices.title).toBe("Facturas");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getBillingDictionary("es")).toBe(es);
    expect(getBillingDictionary("en")).toBe(en);
    expect(getBillingDictionary(null)).toBe(en);
  });
});
