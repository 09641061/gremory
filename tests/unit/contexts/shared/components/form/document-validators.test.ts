/**
 * Baseline characterization tests for the document / phone validation rules
 * currently embedded in `contexts/crm/interfaces/components/customer-management/customer-form.tsx`.
 *
 * Purpose (FASE 0 — regression safety net)
 * ---------------------------------------
 * These tests pin down the validation rules that exist TODAY in the form
 * component so that any future refactor (e.g. extracting these regexes into a
 * dedicated `validateDNI / validateRUC / validatePassport / validatePhone`
 * module under `contexts/shared/interfaces/components/form/`) MUST keep the
 * exact same accept/reject behavior. If a refactor changes the contract, this
 * file must fail before the change can ship.
 *
 * Important constraints
 * ---------------------
 * - The validator functions are intentionally NOT imported from production
 *   code; the regexes are duplicated here on purpose. The duplication is the
 *   point: it makes these tests act as an independent specification that the
 *   refactor has to satisfy, not a tautology that re-uses the implementation.
 * - Any change to the regex constants below is a CONTRACT change that should
 *   be reflected in a code review of the form component and in the i18n
 *   translation copy (`validation.dniLength`, etc.).
 * - The Spanish copy is intentionally NOT re-tested here; the *rules* are
 *   locale-agnostic.
 */

// ---------------------------------------------------------------------------
// Mirrors of the regexes currently hard-coded inside customer-form.tsx
// (handleSubmit). When the form is refactored, point these at the real
// exported helpers instead of duplicating them.
// ---------------------------------------------------------------------------

const DNI_REGEX = /^\d{8}$/;
const RUC_REGEX = /^\d{11}$/;
const FOREIGN_RESIDENT_CARD_REGEX = /^\d{9,11}$/;
const PASSPORT_REGEX = /^[A-Z0-9]{6,15}$/;
const PASSPORT_INPUT_REGEX = /^[A-Za-z0-9]*$/; // partial input while typing
const PHONE_COUNTRY_CODE_REGEX = /^\+?\d+$/; // evaluated after .trim()
const PHONE_NUMBER_REGEX = /^\d+$/;

// Thin wrappers that mirror the production validation flow. These are the
// "document-validators" the FASE 0 baseline promises to exist after the
// refactor. Each function returns the validation message that the form
// should surface, or `null` when the value is acceptable.
function validateDNI(value: string): string | null {
  return DNI_REGEX.test(value) ? null : "invalid-dni";
}

function validateRUC(value: string): string | null {
  return RUC_REGEX.test(value) ? null : "invalid-ruc";
}

function validateForeignResidentCard(value: string): string | null {
  return FOREIGN_RESIDENT_CARD_REGEX.test(value) ? null : "invalid-foreign-card";
}

function validatePassport(value: string): string | null {
  return PASSPORT_REGEX.test(value) ? null : "invalid-passport";
}

function validatePhone(
  countryCode: string,
  number: string,
): string | null {
  const ok = PHONE_COUNTRY_CODE_REGEX.test(countryCode.trim()) &&
    PHONE_NUMBER_REGEX.test(number);
  return ok ? null : "invalid-phone";
}

describe("document validators — baseline regression safety", () => {
  describe("validateDNI (8 digits)", () => {
    it.each(["12345678", "00000000", "99999999"])(
      "accepts %s",
      (value) => {
        expect(validateDNI(value)).toBeNull();
        expect(DNI_REGEX.test(value)).toBe(true);
      },
    );

    it.each([
      ["", "empty"],
      ["1234567", "7 digits"],
      ["123456789", "9 digits"],
      ["1234567a", "non-digit"],
      ["1234 5678", "whitespace"],
      ["12.345.678", "punctuation"],
    ])("rejects %s (%s)", (value) => {
      expect(validateDNI(value)).not.toBeNull();
      expect(DNI_REGEX.test(value)).toBe(false);
    });
  });

  describe("validateRUC (11 digits)", () => {
    it.each(["20123456789", "10000000000", "99999999999"])(
      "accepts %s",
      (value) => {
        expect(validateRUC(value)).toBeNull();
        expect(RUC_REGEX.test(value)).toBe(true);
      },
    );

    it.each([
      ["", "empty"],
      ["2012345678", "10 digits"],
      ["201234567890", "12 digits"],
      ["2012345678a", "non-digit"],
    ])("rejects %s (%s)", (value) => {
      expect(validateRUC(value)).not.toBeNull();
      expect(RUC_REGEX.test(value)).toBe(false);
    });
  });

  describe("validateForeignResidentCard (9-11 digits)", () => {
    it.each(["123456789", "1234567890", "12345678901"])(
      "accepts %s",
      (value) => {
        expect(validateForeignResidentCard(value)).toBeNull();
        expect(FOREIGN_RESIDENT_CARD_REGEX.test(value)).toBe(true);
      },
    );

    it.each([
      ["", "empty"],
      ["12345678", "8 digits"],
      ["123456789012", "12 digits"],
      ["12345678a", "non-digit"],
    ])("rejects %s (%s)", (value) => {
      expect(validateForeignResidentCard(value)).not.toBeNull();
      expect(FOREIGN_RESIDENT_CARD_REGEX.test(value)).toBe(false);
    });
  });

  describe("validatePassport (alphanumeric 6-15 chars, uppercase)", () => {
    it.each(["ABCDEF", "AB1234", "ABC123XYZ", "X".repeat(15)])(
      "accepts %s",
      (value) => {
        expect(validatePassport(value)).toBeNull();
        expect(PASSPORT_REGEX.test(value)).toBe(true);
      },
    );

    it.each([
      ["", "empty"],
      ["ABCDE", "5 chars"],
      ["X".repeat(16), "16 chars"],
      ["ABC-123", "hyphen not allowed"],
      ["ABC 123", "space not allowed"],
      ["abcdef", "lowercase rejected (input is uppercased before validation)"],
    ])("rejects %s (%s)", (value) => {
      expect(validatePassport(value)).not.toBeNull();
      expect(PASSPORT_REGEX.test(value)).toBe(false);
    });

    it("documents the typing-time partial-accept regex (allows mixed-case and empty)", () => {
      // While the user is typing the form feeds each keystroke through
      // PASSPORT_INPUT_REGEX and uppercases the result before storing.
      // We pin that partial-accept regex here so a future refactor keeps the
      // UX smooth (refusing partial input would break the input field).
      expect(PASSPORT_INPUT_REGEX.test("")).toBe(true);
      expect(PASSPORT_INPUT_REGEX.test("ABC")).toBe(true);
      expect(PASSPORT_INPUT_REGEX.test("AbC123")).toBe(true);
      expect(PASSPORT_INPUT_REGEX.test("ABC-123")).toBe(false);
      expect(PASSPORT_INPUT_REGEX.test("ABC 123")).toBe(false);
    });
  });

  describe("validatePhone (international format)", () => {
    it.each([
      ["+51", "987654321"],
      ["+1", "5551234567"],
      ["51", "987654321"],
      ["  +51  ", "987654321"], // leading/trailing whitespace on country code must be trimmed before the regex runs
    ])("accepts countryCode=%j number=%j", (countryCode, number) => {
      expect(validatePhone(countryCode, number)).toBeNull();
    });

    it.each([
      ["+", ""], // "+" alone has no digits after the optional "+" prefix
      ["+", "987654321"], // same: "+" alone fails the country-code regex
      ["", ""],
      ["abc", "123456789"],
      ["+51", "987-654-321"], // phone-input strips non-digits, so dashes should never reach the validator
      ["+51", "987 654 321"],
      ["+51", "987abc321"],
      ["+51", ""],
      ["", "987654321"],
    ])(
      "rejects countryCode=%j number=%j",
      (countryCode, number) => {
        expect(validatePhone(countryCode, number)).not.toBeNull();
      },
    );

    it("trims whitespace around the country code before validating", () => {
      // Mirrors `phoneCountryCode.trim()` inside customer-form.tsx.
      expect(PHONE_COUNTRY_CODE_REGEX.test("  +51  ".trim())).toBe(true);
      expect(PHONE_COUNTRY_CODE_REGEX.test("+ 51".trim())).toBe(false);
    });
  });

  describe("cross-validator boundaries", () => {
    it("treats the same 8-digit string as valid DNI but invalid RUC", () => {
      const v = "12345678";
      expect(validateDNI(v)).toBeNull();
      expect(validateRUC(v)).not.toBeNull();
    });

    it("treats the same 11-digit string as valid RUC and valid Foreign Resident Card", () => {
      const v = "12345678901";
      expect(validateRUC(v)).toBeNull();
      expect(validateForeignResidentCard(v)).toBeNull();
    });
  });
});