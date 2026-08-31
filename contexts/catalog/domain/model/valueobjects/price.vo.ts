export type Price = Readonly<{ amount: number }>;

export function createPrice(amount: number): Price {
  if (amount < 0) {
    throw new Error("Price cannot be negative");
  }
  return Object.freeze({ amount: Number(amount.toFixed(2)) });
}
