export type SubscriptionAccessSnapshot = Readonly<{
  active?: boolean;
  status?: string | null;
  planId?: number;
  planName?: string | null;
  billingCycle?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
  pendingPlanId?: number | null;
  pendingBillingCycle?: string | null;
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
 */
export function hasAssistantSubscriptionAccess(
  subscription: SubscriptionAccessSnapshot | null | undefined,
): boolean {
  return hasActiveSubscription(subscription) && (subscription?.planId ?? 0) > 0;
}

/**
 * Whether the assistant permission should render locked in the role editor.
 * With no free plan, the assistant is always available on active subscriptions.
 */
export function isAssistantPermissionLocked(
  subscription: SubscriptionAccessSnapshot | null | undefined,
): boolean {
  return !hasActiveSubscription(subscription);
}

export function getApplicationHomePath(
  subscription: SubscriptionAccessSnapshot | null | undefined,
): "/chat" | "/schedule" {
  return hasAssistantSubscriptionAccess(subscription) ? "/chat" : "/schedule";
}
