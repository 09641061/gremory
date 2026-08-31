export type CurrencyCode = "PEN" | "USD" | "EUR";

export type Currency = Readonly<{ value: CurrencyCode; symbol: string }>;

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  PEN: "S/.",
  USD: "$",
  EUR: "€",
};

export const SUPPORTED_CURRENCIES: readonly { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: "PEN", symbol: "S/.", label: "PEN" },
  { code: "USD", symbol: "$", label: "USD" },
  { code: "EUR", symbol: "€", label: "EUR" },
];

/**
 * Returns the display symbol for a given CurrencyCode.
 */
export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCY_SYMBOLS[code] ?? "$";
}

/**
 * Creates an immutable Currency Value Object validating currency invariants.
 */
export function createCurrency(code: string): Currency {
  const normalized = code.trim().toUpperCase() as CurrencyCode;
  if (normalized !== "PEN" && normalized !== "USD" && normalized !== "EUR") {
    throw new Error("Invalid Currency. Expected 'PEN', 'USD', or 'EUR'");
  }
  return Object.freeze({
    value: normalized,
    symbol: getCurrencySymbol(normalized),
  });
}
