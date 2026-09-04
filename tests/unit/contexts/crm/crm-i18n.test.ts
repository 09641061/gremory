import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getCrmDictionary,
  crmLocales,
} from "@/contexts/crm/interfaces/i18n";

describe("CRM i18n translations", () => {
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
    expect(en.directory.title).toBe("Customers");
    expect(es.directory.title).toBe("Clientes");
    expect(en.directory.addCustomer).toBe("Add customer");
    expect(es.directory.addCustomer).toBe("Añadir cliente");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getCrmDictionary("es")).toBe(es);
    expect(getCrmDictionary("en")).toBe(en);
    expect(getCrmDictionary(null)).toBe(en);
  });
});
