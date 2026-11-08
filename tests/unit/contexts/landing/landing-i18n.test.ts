import { describe, expect, it } from "vitest";
import { en } from "@/contexts/landing/interfaces/i18n/locales/en";
import { es } from "@/contexts/landing/interfaces/i18n/locales/es";

type Tree = { [key: string]: string | Tree | readonly Tree[] };

function collectPaths(node: Tree, prefix = ""): string[] {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") return [path];
    if (Array.isArray(value)) {
      return value.flatMap((item, index) => {
        const itemPath = `${path}.${index}`;
        return typeof item === "string" ? [itemPath] : collectPaths(item, itemPath);
      });
    }
    return collectPaths(value, path);
  });
}

function collectEmptyPaths(node: Tree, prefix = ""): string[] {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      return value.trim().length === 0 ? [path] : [];
    }
    if (Array.isArray(value)) {
      return value.flatMap((item, index) => {
        const itemPath = `${path}.${index}`;
        if (typeof item === "string") {
          return item.trim().length === 0 ? [itemPath] : [];
        }
        return collectEmptyPaths(item, itemPath);
      });
    }
    return collectEmptyPaths(value, path);
  });
}

describe("Landing i18n", () => {
  it("keeps the same keys in both locales", () => {
    const esPaths = collectPaths(es.landing as unknown as Tree).sort();
    const enPaths = collectPaths(en.landing as unknown as Tree).sort();

    expect(esPaths).toEqual(enPaths);
  });

  it("has no empty translations", () => {
    expect(collectEmptyPaths(es.landing as unknown as Tree)).toEqual([]);
    expect(collectEmptyPaths(en.landing as unknown as Tree)).toEqual([]);
  });

  it("exposes the landing branch through the shared locale dictionary", () => {
    expect(es.landing.nav.brand).toBe("Takodu");
    expect(en.landing.nav.brand).toBe("Takodu");
    expect(es.landing.pricing.plans.negocio.price).toBe("S/ 149");
    expect(en.landing.pricing.plans.negocio.price).toBe("S/ 149");
  });
});
