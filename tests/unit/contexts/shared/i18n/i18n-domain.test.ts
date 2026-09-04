import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  normalizeLocale,
} from "@/contexts/shared/domain/model/i18n";

describe("i18n domain model", () => {
  it("should have 'en' as DEFAULT_LOCALE", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });

  it("should support 'es' and 'en'", () => {
    expect(SUPPORTED_LOCALES).toEqual(["es", "en"]);
  });

  it("should correctly identify supported locales", () => {
    expect(isSupportedLocale("es")).toBe(true);
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("fr")).toBe(false);
    expect(isSupportedLocale(null)).toBe(false);
    expect(isSupportedLocale(undefined)).toBe(false);
  });

  it("should normalize locale strings case-insensitively", () => {
    expect(normalizeLocale("ES")).toBe("es");
    expect(normalizeLocale("EN")).toBe("en");
    expect(normalizeLocale("es")).toBe("es");
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("  en  ")).toBe("en");
    expect(normalizeLocale("es-ES")).toBe("es");
    expect(normalizeLocale("en-US")).toBe("en");
  });

  it("should fall back to DEFAULT_LOCALE for invalid or missing values", () => {
    expect(normalizeLocale(null)).toBe("en");
    expect(normalizeLocale(undefined)).toBe("en");
    expect(normalizeLocale("")).toBe("en");
    expect(normalizeLocale("unknown")).toBe("en");
  });
});
