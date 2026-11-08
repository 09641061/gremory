import type { SubscriptionAccessSnapshot } from "../../../domain/services/subscription-access.policy";
import type { BillingSubscriptionReader, BillingSubscriptionReadModel, BillingRequestContext } from "../../ports/billing-readers-writers";

export class CurrentSubscriptionQueryService {
  constructor(private readonly reader: BillingSubscriptionReader) {}

  async getCurrentSubscription(accessToken: string, context?: BillingRequestContext): Promise<SubscriptionAccessSnapshot> {
    const subscription = await this.reader.getCurrentSubscription(accessToken, context);
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
    context?: BillingRequestContext,
  ): Promise<SubscriptionAccessSnapshot | null> {
    try {
      return await this.getCurrentSubscription(accessToken, context);
    } catch {
      return null;
    }
  }
}

export function createCurrentSubscriptionQueryService(reader?: BillingSubscriptionReader) {
  return new CurrentSubscriptionQueryService(reader ?? unavailableSubscriptionReader);
}

const unavailableSubscriptionReader: BillingSubscriptionReader = {
  async getCurrentSubscription() {
    throw new Error("Billing composition is required for subscription reads");
  },
};

function toSubscriptionAccessSnapshot(
  subscription: BillingSubscriptionReadModel,
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
