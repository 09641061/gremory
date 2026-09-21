/**
 * Document / phone validators shared by every form under the `shared`
 * interfaces layer.
 *
 * Contract
 * --------
 * These helpers are pure, locale-agnostic, and intentionally return
 * `boolean` (not a translated message). The caller — typically a form
 * component — owns the error copy and the translation. That keeps the
 * validators reusable across CRM, scheduling, billing and catalog forms
 * without dragging a specific i18n namespace.
 *
 * The regexes here MUST stay byte-for-byte equal to the ones currently
 * embedded inside `customer-form.tsx` (handleSubmit). The baseline
 * characterization suite (`tests/unit/contexts/shared/components/form/
 * document-validators.test.ts`) pins those exact patterns as the regression
 * safety net: any change here is a contract change and must be reflected in
 * the customer form in the same commit.
 *
 * If a future bounded context needs a different rule (e.g. a longer
 * passport), add a NEW validator rather than mutating these — the existing
 * baseline tests will catch the silent regression.
 */

const DNI_REGEX = /^\d{8}$/;
const RUC_REGEX = /^\d{11}$/;
const FOREIGN_RESIDENT_CARD_REGEX = /^\d{9,11}$/;
const PASSPORT_REGEX = /^[A-Z0-9]{6,15}$/;
const PHONE_COUNTRY_CODE_REGEX = /^\+?\d+$/;
const PHONE_NUMBER_REGEX = /^\d+$/;

/** Accepts an 8-digit DNI (Peruvian national ID). */
export function validateDNI(value: string): boolean {
  return DNI_REGEX.test(value);
}

/** Accepts an 11-digit RUC (tax ID for companies). */
export function validateRUC(value: string): boolean {
  return RUC_REGEX.test(value);
}

/** Accepts a 9-to-11-digit Foreign Resident Card number. */
export function validateForeignResidentCard(value: string): boolean {
  return FOREIGN_RESIDENT_CARD_REGEX.test(value);
}

/**
 * Accepts a 6-to-15 character uppercase alphanumeric passport number.
 * The form is expected to uppercase the raw input BEFORE this runs (the
 * customer form does so on every keystroke). Lowercase input therefore
 * fails — keep that behaviour so a regression in the uppercasing pipeline
 * surfaces here instead of silently slipping through.
 */
export function validatePassport(value: string): boolean {
  return PASSPORT_REGEX.test(value);
}

/**
 * Accepts an international phone number composed of a country code (e.g.
 * `+51`, `+1`, or unprefixed `51`) and a numeric local number.
 *
 * Leading/trailing whitespace around the country code is trimmed before the
 * regex runs — mirroring the `.trim()` in the original customer form. The
 * local number must be strictly digits; the form's phone input is expected
 * to strip dashes/spaces before calling this helper.
 */
export function validatePhone(countryCode: string, number: string): boolean {
  const trimmedCountry = countryCode.trim();
  return (
    PHONE_COUNTRY_CODE_REGEX.test(trimmedCountry) &&
    PHONE_NUMBER_REGEX.test(number)
  );
}
