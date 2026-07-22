export type BillingCycleType = "MONTHLY" | "ANNUAL";

export type BillingCycle = Readonly<{ value: BillingCycleType }>;

/**
 * Creates an immutable BillingCycle Value Object validating cycle invariants.
 */
export function createBillingCycle(value: string): BillingCycle {
  const normalized = value.trim().toUpperCase();
  if (normalized !== "MONTHLY" && normalized !== "ANNUAL") {
    throw new Error("Invalid BillingCycle. Expected 'MONTHLY' or 'ANNUAL'");
  }
  return Object.freeze({ value: normalized as BillingCycleType });
}
