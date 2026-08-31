import { describe, it, expect } from "vitest";
import { createPlanId } from "@/contexts/billing/domain/model/value-objects/plan-id";
import { createBillingCycle } from "@/contexts/billing/domain/model/value-objects/billing-cycle";
import { createCurrency } from "@/contexts/billing/domain/model/value-objects/currency";
import { createPrice } from "@/contexts/billing/domain/model/value-objects/price";
import { Plan } from "@/contexts/billing/domain/model/entities/plan";
import { PlanPricingPolicy } from "@/contexts/billing/domain/services/plan-pricing-policy";

describe("Billing Domain Model & Policies", () => {
  it("validates PlanId value object invariants", () => {
    expect(createPlanId(0).value).toBe(0);
    expect(createPlanId(1).value).toBe(1);
    expect(createPlanId(2).value).toBe(2);
    expect(() => createPlanId(3)).toThrow("Invalid PlanId");
  });

  it("validates BillingCycle value object invariants", () => {
    expect(createBillingCycle("monthly").value).toBe("MONTHLY");
    expect(createBillingCycle("annual").value).toBe("ANNUAL");
    expect(() => createBillingCycle("weekly")).toThrow("Invalid BillingCycle");
  });

  it("validates Currency value object invariants", () => {
    expect(createCurrency("pen").symbol).toBe("S/.");
    expect(createCurrency("usd").symbol).toBe("$");
    expect(createCurrency("eur").symbol).toBe("€");
    expect(() => createCurrency("cad")).toThrow("Invalid Currency");
  });

  it("validates Price value object invariants", () => {
    const price = createPrice(75.0, "PEN");
    expect(price.amount).toBe(75);
    expect(price.currency.value).toBe("PEN");
    expect(() => createPrice(-10, "USD")).toThrow("Price must be a non-negative number");
  });

  it("calculates plan pricing policy correctly for PEN, USD, and EUR", () => {
    const policy = new PlanPricingPolicy();
    
    // Free plan is always zero cost
    const usdFreeMonthly = policy.calculateMonthlyEquivalentPrice(0, "USD", "MONTHLY");
    expect(usdFreeMonthly.amount).toBe(0);

    // Standard Monthly PEN
    const penStandardMonthly = policy.calculateMonthlyEquivalentPrice(1, "PEN", "MONTHLY");
    expect(penStandardMonthly.amount).toBe(75);

    // Standard Annual PEN equivalent (750 / 12 = 62.50)
    const penStandardAnnual = policy.calculateMonthlyEquivalentPrice(1, "PEN", "ANNUAL");
    expect(penStandardAnnual.amount).toBe(62.5);

    // Premium Monthly USD
    const usdPremiumMonthly = policy.calculateMonthlyEquivalentPrice(2, "USD", "MONTHLY");
    expect(usdPremiumMonthly.amount).toBe(50);
  });

  it("evaluates Plan entity invariants and helper methods", () => {
    const standardPlan = new Plan(createPlanId(1), "Standard", "Desc", 1, []);
    expect(standardPlan.isUnlimitedEstablishments()).toBe(false);

    const premiumPlan = new Plan(createPlanId(2), "Premium", "Desc", -1, []);
    expect(premiumPlan.isUnlimitedEstablishments()).toBe(true);
  });
});
