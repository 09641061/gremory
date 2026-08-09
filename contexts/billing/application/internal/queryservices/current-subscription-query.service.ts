import "server-only";

import { BillingApiGateway, type SubscriptionResponse } from "../../../infrastructure/gateways/billing-api.gateway";
import type { SubscriptionAccessSnapshot } from "../../../domain/services/subscription-access.policy";

export class CurrentSubscriptionQueryService {
  async getCurrentSubscription(accessToken: string): Promise<SubscriptionAccessSnapshot> {
    const subscription = await new BillingApiGateway().getCurrentSubscription(accessToken);
    return toSubscriptionAccessSnapshot(subscription);
  }
}

export function createCurrentSubscriptionQueryService() {
  return new CurrentSubscriptionQueryService();
}

function toSubscriptionAccessSnapshot(
  subscription: SubscriptionResponse,
): SubscriptionAccessSnapshot {
  return {
    active: subscription.active,
    status: subscription.status,
    planId: subscription.planId,
  };
}
