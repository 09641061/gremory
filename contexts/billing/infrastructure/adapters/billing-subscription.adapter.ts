import "server-only";

import {
  BillingApiGateway,
  type RenewSubscriptionRequest,
  type SubscriptionResponse,
} from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";
import type { CreateSubscriptionCommand } from "@/contexts/billing/domain/model/commands/create-subscription.command";

export type BillingSubscriptionSnapshot = SubscriptionResponse;

export class BillingSubscriptionAdapter {
  getCurrentSubscription(accessToken: string): Promise<SubscriptionResponse> {
    return new BillingApiGateway().getCurrentSubscription(accessToken);
  }

  createSubscription(
    accessToken: string,
    command: CreateSubscriptionCommand,
  ): Promise<SubscriptionResponse> {
    return new BillingApiGateway().createSubscription(accessToken, command);
  }

  renewSubscription(
    accessToken: string,
    request: RenewSubscriptionRequest,
  ): Promise<SubscriptionResponse> {
    return new BillingApiGateway().renewSubscription(accessToken, request);
  }

  cancelSubscription(accessToken: string): Promise<SubscriptionResponse> {
    return new BillingApiGateway().cancelSubscription(accessToken);
  }
}

export function createBillingSubscriptionAdapter() {
  return new BillingSubscriptionAdapter();
}
