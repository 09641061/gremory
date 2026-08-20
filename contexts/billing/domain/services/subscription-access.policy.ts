export type SubscriptionAccessSnapshot = Readonly<{
  active?: boolean;
  status?: string | null;
  planId?: number;
  planName?: string | null;
  billingCycle?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
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

/**
 * Whether the assistant permission should render locked in the role editor.
 * The subscription always describes the owner's plan, so a Free plan means
 * the owner cannot enable the AI assistant and the permission is shown but
 * not assignable (an upsell gate instead of a surprise rejection).
 */
export function isAssistantPermissionLocked(
  subscription: SubscriptionAccessSnapshot | null | undefined,
): boolean {
  return (subscription?.planName ?? "").trim().toUpperCase() === "FREE";
}

export function getApplicationHomePath(
  subscription: SubscriptionAccessSnapshot | null | undefined,
): "/chat" | "/schedule" {
  return hasAssistantSubscriptionAccess(subscription) ? "/chat" : "/schedule";
}
