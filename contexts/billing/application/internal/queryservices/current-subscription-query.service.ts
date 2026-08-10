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
