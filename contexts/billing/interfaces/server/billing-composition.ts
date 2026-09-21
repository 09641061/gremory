import "server-only";

import { BillingApiGateway } from "../../infrastructure/gateways/billing-api.gateway";
import { CreateSubscriptionCommandService } from "../../application/internal/commandservices/create-subscription-command.service";
import { CurrentSubscriptionQueryService } from "../../application/internal/queryservices/current-subscription-query.service";
import { ListPlansQueryService } from "../../application/internal/queryservices/list-plans-query.service";
import { SubscriptionAccessQueryService } from "../../application/internal/queryservices/subscription-access-query.service";

/**
 * Server-only composition for the Billing bounded context.
 *
 * Composition returns a fresh set of adapters per invocation. Callers MUST NOT
 * import the gateway directly. Future migration target: replace this with
 * `application/ports/{plan-reader, subscription-reader, subscription-writer,
 * invoice-reader}.ts` once the gateway implements those consumer-owned
 * contracts.
 */
export type ComposedBillingAdapters = Readonly<{
  gateway: BillingApiGateway;
  createSubscriptionService: CreateSubscriptionCommandService;
  currentSubscriptionService: CurrentSubscriptionQueryService;
  listPlansService: ListPlansQueryService;
  subscriptionAccessService: SubscriptionAccessQueryService;
}>;

export function composeBillingAdapters(): ComposedBillingAdapters {
  const gateway = new BillingApiGateway();
  return {
    gateway,
    createSubscriptionService: new CreateSubscriptionCommandService(),
    currentSubscriptionService: new CurrentSubscriptionQueryService(),
    listPlansService: new ListPlansQueryService(),
    subscriptionAccessService: new SubscriptionAccessQueryService(),
  };
}
