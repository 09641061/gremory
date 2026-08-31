import { SubscriptionId } from "../value-objects/subscription-id";
import { PlanId } from "../value-objects/plan-id";
import { BillingCycle } from "../value-objects/billing-cycle";
import { Currency } from "../value-objects/currency";

export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "PAST_DUE"
  | "SUSPENDED"
  | "CANCELLED";

export class Subscription {
  constructor(
    public readonly id: SubscriptionId,
    public readonly ownerId: string,
    public readonly planId: PlanId,
    public readonly billingCycle: BillingCycle,
    public readonly currency: Currency,
    public readonly status: SubscriptionStatus = "PENDING"
  ) {
    if (!ownerId.trim()) throw new Error("OwnerId is required");
  }

  public isActive(): boolean {
    return this.status === "ACTIVE";
  }

  public isPending(): boolean {
    return this.status === "PENDING";
  }
}
