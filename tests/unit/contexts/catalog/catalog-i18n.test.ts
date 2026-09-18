import { describe, expect, it } from "vitest";
import {
  en,
  es,
  getCatalogDictionary,
} from "@/contexts/catalog/interfaces/i18n";

describe("Catalog i18n translations", () => {
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
    expect(en.sidebar.createCategory).toBe("Create Category");
    expect(es.sidebar.createCategory).toBe("Crear categoría");
    expect(en.serviceForm.createTitle).toBe("Create New Service");
    expect(es.serviceForm.createTitle).toBe("Crear nuevo servicio");
  });

  it("should return the correct dictionary by locale", () => {
    expect(getCatalogDictionary("es")).toBe(es);
    expect(getCatalogDictionary("en")).toBe(en);
    expect(getCatalogDictionary(null)).toBe(en);
  });
});
