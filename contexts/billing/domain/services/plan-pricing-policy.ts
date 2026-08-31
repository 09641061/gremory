import { PlanIdValue } from "../model/value-objects/plan-id";
import { CurrencyCode } from "../model/value-objects/currency";
import { BillingCycleType } from "../model/value-objects/billing-cycle";
import { Price, createPrice } from "../model/value-objects/price";

const FIXED_PRICING_MATRIX: Record<
  PlanIdValue,
  Record<CurrencyCode, { monthly: number; annual: number }>
> = {
  0: {
    PEN: { monthly: 0, annual: 0 },
    USD: { monthly: 0, annual: 0 },
    EUR: { monthly: 0, annual: 0 },
  },
  1: {
    PEN: { monthly: 75.0, annual: 750.0 },
    USD: { monthly: 20.0, annual: 200.0 },
    EUR: { monthly: 18.0, annual: 180.0 },
  },
  2: {
    PEN: { monthly: 190.0, annual: 1900.0 },
    USD: { monthly: 50.0, annual: 500.0 },
    EUR: { monthly: 45.0, annual: 450.0 },
  },
};

export class PlanPricingPolicy {
  /**
   * Calculates the monthly price object for a plan given its currency and billing cycle.
   */
  public calculateMonthlyEquivalentPrice(
    planId: PlanIdValue,
    currencyCode: CurrencyCode,
    billingCycle: BillingCycleType
  ): Price {
    const planPrices = FIXED_PRICING_MATRIX[planId][currencyCode];
    if (billingCycle === "ANNUAL") {
      const pricePerMonth = planPrices.annual / 12;
      return createPrice(pricePerMonth, currencyCode);
    }
    return createPrice(planPrices.monthly, currencyCode);
  }

  /**
   * Returns the total cost for the chosen billing cycle.
   */
  public calculateTotalCyclePrice(
    planId: PlanIdValue,
    currencyCode: CurrencyCode,
    billingCycle: BillingCycleType
  ): Price {
    const planPrices = FIXED_PRICING_MATRIX[planId][currencyCode];
    const amount = billingCycle === "ANNUAL" ? planPrices.annual : planPrices.monthly;
    return createPrice(amount, currencyCode);
  }
}
