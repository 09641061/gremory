export type SubscriptionAccessSnapshot = Readonly<{
  active?: boolean;
  status?: string;
  planId?: number;
  billingCycle?: string;
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

/**
 * Assistant access is only available on paid plans.
 * Free subscriptions can still be active for the core product.
 */
export function hasAssistantSubscriptionAccess(
  subscription: SubscriptionAccessSnapshot | null | undefined,
): boolean {
  return hasActiveSubscription(subscription) && (subscription?.planId ?? 0) > 0;
}

export function getApplicationHomePath(
  subscription: SubscriptionAccessSnapshot | null | undefined,
): "/chat" | "/schedule" {
  return hasAssistantSubscriptionAccess(subscription) ? "/chat" : "/schedule";
}
