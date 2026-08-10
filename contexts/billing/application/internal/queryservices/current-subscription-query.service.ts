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
   * Subscription is a capability input, never a prerequisite: a user that owns
   * no subscription (an invited member, for instance) has no plan, not an
   * error. Callers that render the app shell must keep working, so the absence
   * is modelled as `null` instead of a thrown Billing failure.
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
  };
}
