import "server-only";

import { BillingApiGateway, type SubscriptionResponse } from "../../../infrastructure/gateways/billing-api.gateway";

export class CurrentSubscriptionQueryService {
  async getCurrentSubscription(accessToken: string): Promise<SubscriptionResponse> {
    return new BillingApiGateway().getCurrentSubscription(accessToken);
  }
}

export function createCurrentSubscriptionQueryService() {
  return new CurrentSubscriptionQueryService();
}
