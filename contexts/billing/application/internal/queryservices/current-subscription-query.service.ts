import "server-only";

import type { SubscriptionAccessSnapshot } from "../../../domain/services/subscription-access.policy";
import {
  createBillingSubscriptionAdapter,
  type BillingSubscriptionSnapshot,
} from "@/contexts/billing/infrastructure/adapters/billing-subscription.adapter";

export class CurrentSubscriptionQueryService {
  async getCurrentSubscription(accessToken: string): Promise<SubscriptionAccessSnapshot> {
    const subscription = await createBillingSubscriptionAdapter().getCurrentSubscription(
      accessToken,
    );
    return toSubscriptionAccessSnapshot(subscription);
  }

  /**
   * Optional read for billing UI. The entry-route resolver uses the strict
   * method above so it can distinguish a missing subscription from a Billing
   * outage; this convenience method intentionally keeps those failures out of
   * non-routing billing surfaces.
   */
  async getCurrentSubscriptionSnapshot(
    accessToken: string,
  ): Promise<SubscriptionAccessSnapshot | null> {
    try {
      return await this.getCurrentSubscription(accessToken);
    } catch {
      return null;
    }
  }
}

export function createCurrentSubscriptionQueryService() {
  return new CurrentSubscriptionQueryService();
}

function toSubscriptionAccessSnapshot(
  subscription: BillingSubscriptionSnapshot,
): SubscriptionAccessSnapshot {
  return {
    active: subscription.active,
    status: subscription.status,
    planId: subscription.planId,
    billingCycle: subscription.billingCycle,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    currentPeriodEnd: subscription.currentPeriodEnd,
    pendingPlanId: subscription.pendingPlanId,
    pendingBillingCycle: subscription.pendingBillingCycle,
  };
}
