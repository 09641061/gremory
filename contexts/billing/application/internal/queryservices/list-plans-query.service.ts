import { Plan } from "../../../domain/model/entities/plan";
import { createPlanId } from "../../../domain/model/value-objects/plan-id";
import { PlanPricingPolicy } from "../../../domain/services/plan-pricing-policy";
import type { CurrencyCode } from "../../../domain/model/value-objects/currency";

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
    const freePlan = new Plan(
      createPlanId(0),
      "Free",
      "Try the core product experience.",
      1,
      [
        "Create and manage your organization",
        "Core operational workflows",
        "Upgrade later when you need automation",
      ],
      false
    );

    const standardPlan = new Plan(
      createPlanId(1),
      "Standard",
      "Perfect for startups and local shops.",
      1,
      [
        "1 establishment included",
        "Core billing tools",
        "Standard API access",
        "Email support",
      ],
      false
    );

    const premiumPlan = new Plan(
      createPlanId(2),
      "Premium",
      "For growing enterprises with complex needs.",
      -1,
      [
        "Unlimited establishments",
        "Advanced analytics dashboard",
        "Custom domain integration",
        "24/7 Priority support",
        "Bulk invoice management",
      ],
      true
    );

    return [freePlan, standardPlan, premiumPlan].map((plan) => {
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
