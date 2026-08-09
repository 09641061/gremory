import "server-only";

import {
  BillingApiGateway,
  type RenewSubscriptionRequest,
  type SubscriptionResponse,
} from "../../../infrastructure/gateways/billing-api.gateway";
import type { CreateSubscriptionCommand } from "../../../domain/model/commands/create-subscription.command";

export type BillingSubscriptionSnapshot = SubscriptionResponse;

export class BillingSubscriptionOutboundService {
  async getCurrentSubscription(accessToken: string): Promise<SubscriptionResponse> {
    return new BillingApiGateway().getCurrentSubscription(accessToken);
  }

  async createSubscription(
    accessToken: string,
    command: CreateSubscriptionCommand,
  ): Promise<SubscriptionResponse> {
    return new BillingApiGateway().createSubscription(accessToken, command);
  }

  async renewSubscription(
    accessToken: string,
    request: RenewSubscriptionRequest,
  ): Promise<SubscriptionResponse> {
    return new BillingApiGateway().renewSubscription(accessToken, request);
  }

  async cancelSubscription(accessToken: string): Promise<SubscriptionResponse> {
    return new BillingApiGateway().cancelSubscription(accessToken);
  }
}

export function createBillingSubscriptionOutboundService() {
  return new BillingSubscriptionOutboundService();
}
