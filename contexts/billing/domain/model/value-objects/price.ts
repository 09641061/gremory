import { Currency, createCurrency } from "./currency";

export type Price = Readonly<{
  amount: number;
  currency: Currency;
}>;

/**
 * Creates an immutable Price Value Object validating price invariants.
 */
export function createPrice(amount: number, currencyInput: string | Currency): Price {
  if (typeof amount !== "number" || isNaN(amount) || amount < 0) {
    throw new Error("Invalid Price amount. Price must be a non-negative number.");
  }

  const currency =
    typeof currencyInput === "string"
      ? createCurrency(currencyInput)
      : currencyInput;

  return Object.freeze({
    amount: Number(amount.toFixed(2)),
    currency,
  });
}
