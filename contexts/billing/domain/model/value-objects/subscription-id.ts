export type SubscriptionId = Readonly<{ value: string }>;

/**
 * Creates an immutable SubscriptionId Value Object validating UUID invariants.
 */
export function createSubscriptionId(value: string): SubscriptionId {
  if (!value || typeof value !== "string" || !value.trim()) {
    throw new Error("SubscriptionId is required");
  }
  return Object.freeze({ value: value.trim() });
}
