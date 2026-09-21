/**
 * Implementation tests for the shared document / phone validators.
 *
 * Scope
 * -----
 * - The baseline characterization suite (`document-validators.test.ts`)
 *   intentionally duplicates the regexes to act as an INDEPENDENT
 *   specification of the contract. It must keep passing even if the
 *   production helpers are rewritten, deleted or moved.
 * - This file is the OPPOSITE: it imports the production helpers
 *   directly. Its job is to prove that the helpers actually implement the
 *   contract the baseline pins down. If the helpers drift, this file
 *   fails before the baseline does.
 *
 * Together the two files form a bidirectional regression net: change the
 * regexes, both files fail; rewrite the implementation, only this file
 * fails. That asymmetry is the safety property.
 */

import { describe, it, expect } from "vitest";

import {
  validateDNI,
  validateForeignResidentCard,
  validatePassport,
  validatePhone,
  validateRUC,
} from "@/contexts/shared/interfaces/components/form/document-validators";

// ---------------------------------------------------------------------------
// validateDNI — 8 digits
// ---------------------------------------------------------------------------

describe("validateDNI (8 digits)", () => {
  it.each(["12345678", "00000000", "99999999"])(
    "accepts %s",
    (value) => {
      expect(validateDNI(value)).toBe(true);
    },
  );

  it.each([
    ["", "empty"],
    ["1234567", "7 digits"],
    ["123456789", "9 digits"],
    ["1234567a", "non-digit at the end"],
    ["a2345678", "non-digit at the start"],
    ["1234 5678", "whitespace inside"],
    ["12.345.678", "punctuation inside"],
    ["12345678\n", "trailing newline"],
  ])("rejects %s (%s)", (value) => {
    expect(validateDNI(value)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateRUC — 11 digits
// ---------------------------------------------------------------------------

describe("validateRUC (11 digits)", () => {
  it.each(["20123456789", "10000000000", "99999999999"])(
    "accepts %s",
    (value) => {
      expect(validateRUC(value)).toBe(true);
    },
  );

  it.each([
    ["", "empty"],
    ["2012345678", "10 digits"],
    ["201234567890", "12 digits"],
    ["2012345678a", "non-digit at the end"],
    ["20.123.456.789", "punctuation"],
  ])("rejects %s (%s)", (value) => {
    expect(validateRUC(value)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateForeignResidentCard — 9 to 11 digits
// ---------------------------------------------------------------------------

describe("validateForeignResidentCard (9-11 digits)", () => {
  it.each(["123456789", "1234567890", "12345678901"])(
    "accepts %s",
    (value) => {
      expect(validateForeignResidentCard(value)).toBe(true);
    },
  );

  it.each([
    ["", "empty"],
    ["12345678", "8 digits"],
    ["123456789012", "12 digits"],
    ["12345678a", "non-digit"],
  ])("rejects %s (%s)", (value) => {
    expect(validateForeignResidentCard(value)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validatePassport — uppercase alphanumeric, 6-15 chars
// ---------------------------------------------------------------------------

describe("validatePassport (uppercase alphanumeric, 6-15 chars)", () => {
  it.each([
    "ABCDEF",
    "AB1234",
    "ABC123XYZ",
    "X".repeat(15),
  ])("accepts %s", (value) => {
    expect(validatePassport(value)).toBe(true);
  });

  it.each([
    ["", "empty"],
    ["ABCDE", "5 chars"],
    ["X".repeat(16), "16 chars"],
    ["ABC-123", "hyphen rejected"],
    ["ABC 123", "space rejected"],
    ["abcdef", "lowercase rejected (form must uppercase before validating)"],
    ["ABCDÉF", "accented letter rejected"],
  ])("rejects %s (%s)", (value) => {
    expect(validatePassport(value)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validatePhone — country code (with optional +) + numeric local number
// ---------------------------------------------------------------------------

describe("validatePhone (international format)", () => {
  it.each([
    ["+51", "987654321"],
    ["+1", "5551234567"],
    ["51", "987654321"],
    ["  +51  ", "987654321"], // surrounding whitespace must be trimmed
  ])("accepts countryCode=%j number=%j", (countryCode, number) => {
    expect(validatePhone(countryCode, number)).toBe(true);
  });

  it.each([
    ["+", ""], // "+" alone has no digits after the optional prefix
    ["+", "987654321"],
    ["", ""],
    ["abc", "123456789"],
    ["+51", "987-654-321"], // input is expected to strip non-digits first
    ["+51", "987 654 321"],
    ["+51", "987abc321"],
    ["+51", ""],
    ["", "987654321"],
  ])(
    "rejects countryCode=%j number=%j",
    (countryCode, number) => {
      expect(validatePhone(countryCode, number)).toBe(false);
    },
  );

  it("only trims whitespace around the country code, not the number", () => {
    // The number is checked verbatim: any whitespace makes it fail.
    expect(validatePhone("+51", "987654321")).toBe(true);
    expect(validatePhone("+51", " 987654321")).toBe(false);
    expect(validatePhone("+51", "987654321 ")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Cross-validator boundaries — same input, different accept rules
// ---------------------------------------------------------------------------

describe("cross-validator boundaries", () => {
  it("treats the same 8-digit string as valid DNI but invalid RUC", () => {
    const v = "12345678";
    expect(validateDNI(v)).toBe(true);
    expect(validateRUC(v)).toBe(false);
  });

  it("treats the same 11-digit string as valid RUC AND valid Foreign Resident Card", () => {
    const v = "12345678901";
    expect(validateRUC(v)).toBe(true);
    expect(validateForeignResidentCard(v)).toBe(true);
  });

  it("rejects every document validator for an empty string", () => {
    expect(validateDNI("")).toBe(false);
    expect(validateRUC("")).toBe(false);
    expect(validateForeignResidentCard("")).toBe(false);
    expect(validatePassport("")).toBe(false);
  });
});
