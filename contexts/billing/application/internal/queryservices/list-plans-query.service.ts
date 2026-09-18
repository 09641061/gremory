import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { Plan } from "../../../domain/model/entities/plan";
import { createPlanId } from "../../../domain/model/value-objects/plan-id";
import { PlanPricingPolicy } from "../../../domain/services/plan-pricing-policy";
import {
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from "../../../domain/model/value-objects/currency";

export interface PlanReadModel {
  id: number;
  name: string;
  description: string;
  monthlyPriceAmount: number;
  annualPriceAmount: number;
  features: readonly string[];
  isPopular: boolean;
}

export class ListPlansQueryService {
  private readonly pricingPolicy = new PlanPricingPolicy();

  public getAvailablePlans(
    currencyCode: CurrencyCode
  ): PlanReadModel[] {
    const standardPlan = new Plan(
      createPlanId(1),
      "Standard",
      "Everything you need to manage your business and schedule bookings in one place.",
      1,
      [
        "1 establishment included",
        "Real-time calendar & appointment scheduling",
        "Service catalog & team member assignment",
        "Customer database (CRM)",
        "Standard analytics dashboard (30-day window)",
        "AI Virtual Assistant",
      ],
      false
    );

    const premiumPlan = new Plan(
      createPlanId(2),
      "Max",
      "Multi-location management and advanced business intelligence to maximize revenue.",
      -1,
      [
        "Unlimited establishments (multi-location)",
        "Everything in Standard plan",
        "Business Intelligence & growth trends (90-day window)",
        "Service friction matrix & lost revenue calculation",
        "Workforce productivity & revenue by specialist",
        "AI Virtual Assistant conversion & ROI tracking",
        "Priority support",
      ],
      true
    );

    return [standardPlan, premiumPlan].map((plan) => {
      const planIdVal = plan.id.value;
      const monthlyPriceObj = this.pricingPolicy.calculateMonthlyEquivalentPrice(
        planIdVal,
        currencyCode,
        "MONTHLY"
      );
      const annualPriceObj = this.pricingPolicy.calculateTotalCyclePrice(
        planIdVal,
        currencyCode,
        "ANNUAL"
      );

      return {
        id: plan.id.value,
        name: plan.name,
        description: plan.description,
        monthlyPriceAmount: monthlyPriceObj.amount,
        annualPriceAmount: annualPriceObj.amount,
        features: plan.features,
        isPopular: plan.isPopular,
      };
    });
  }
}

/** The full catalogue priced in every supported currency. */
export type PlansByCurrencyReadModel = Readonly<Record<CurrencyCode, PlanReadModel[]>>;

/**
 * Prices the catalogue in all supported currencies in one read.
 *
 * The catalogue is fixed and `PlanPricingPolicy` is a pure domain policy, so
 * this read is fully deterministic and cacheable. Resolving every currency at
 * once is what lets the client switch currency without a round-trip.
 */
export async function listPlansByCurrencyQueryService(): Promise<PlansByCurrencyReadModel> {
  "use cache";
  cacheLife("days");
  cacheTag("billing-plans");

  const service = new ListPlansQueryService();

  return Object.fromEntries(
    SUPPORTED_CURRENCIES.map(({ code }) => [code, service.getAvailablePlans(code)]),
  ) as PlansByCurrencyReadModel;
}
