import "server-only";

import { BillingApiGateway, type SubscriptionResponse } from "../../../infrastructure/gateways/billing-api.gateway";
import type { CreateSubscriptionCommand } from "../../../domain/model/commands/create-subscription.command";

export type CreateSubscriptionCheckoutSnapshot = Readonly<{
  id: string;
  planId: number;
  billingCycle: string;
  status: string;
  active: boolean;
  clientSecret: string | null;
  stripePublicKey: string | null;
}>;

export class CreateSubscriptionOutboundService {
  async create(
    accessToken: string,
    command: CreateSubscriptionCommand,
  ): Promise<CreateSubscriptionCheckoutSnapshot> {
    const subscription = await new BillingApiGateway().createSubscription(accessToken, command);
    return toCreateSubscriptionCheckoutSnapshot(subscription);
  }
}

export function createSubscriptionOutboundService() {
  return new CreateSubscriptionOutboundService();
}

function toCreateSubscriptionCheckoutSnapshot(
  subscription: SubscriptionResponse,
): CreateSubscriptionCheckoutSnapshot {
  return {
    id: subscription.id,
    planId: subscription.planId,
    billingCycle: subscription.billingCycle,
    status: subscription.status,
    active: subscription.active === true,
    clientSecret: subscription.clientSecret ?? null,
    stripePublicKey: subscription.stripePublicKey ?? null,
  };
}
