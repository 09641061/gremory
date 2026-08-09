import "server-only";

import type { SubscriptionAccessSnapshot } from "../../../domain/services/subscription-access.policy";
import {
  createBillingSubscriptionOutboundService,
  type BillingSubscriptionSnapshot,
} from "../outboundservices/billing-subscription-outbound.service";

export class CurrentSubscriptionQueryService {
  async getCurrentSubscription(accessToken: string): Promise<SubscriptionAccessSnapshot> {
    const subscription = await createBillingSubscriptionOutboundService().getCurrentSubscription(
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
