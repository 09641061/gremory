export type SubscriptionAccessSnapshot = Readonly<{
  active?: boolean;
  status?: string;
}>;

/**
 * Billing is the source of truth for access. The frontend only translates
 * the backend response into a route decision.
 */
export function hasActiveSubscription(
  subscription: SubscriptionAccessSnapshot | null | undefined,
): boolean {
  return subscription?.active === true && subscription.status?.toUpperCase() === "ACTIVE";
}
