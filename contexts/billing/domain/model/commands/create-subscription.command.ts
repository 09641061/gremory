import type { BillingCycleType } from "../value-objects/billing-cycle";
import type { CurrencyCode } from "../value-objects/currency";

// Re-export for domain model backwards compatibility
export type { BillingCycleType as BillingCycle, CurrencyCode as Currency };

export interface CreateSubscriptionCommand {
  ownerId: string;
  planId: number;
  billingCycle: BillingCycleType;
  currency?: CurrencyCode;
  successUrl?: string;
  cancelUrl?: string;
}
