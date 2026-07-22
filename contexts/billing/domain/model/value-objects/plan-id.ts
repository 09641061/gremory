export type PlanIdValue = 1 | 2;

export type PlanId = Readonly<{ value: PlanIdValue }>;

/**
 * Creates an immutable PlanId Value Object validating plan invariants.
 */
export function createPlanId(value: number): PlanId {
  if (value !== 1 && value !== 2) {
    throw new Error("Invalid PlanId. Expected 1 (Standard) or 2 (Premium)");
  }
  return Object.freeze({ value: value as PlanIdValue });
}
