export interface LandingPricingPlan {
  readonly planId: string | number;
  readonly name: string;
  readonly nameKey?: string;
  readonly descriptionKey: string;
  readonly priceMonthly: number;
  readonly priceAnnualMonthly: number;
  readonly currency: string;
  readonly features: readonly string[];
  readonly featuresKeys?: readonly string[];
  readonly isPopular: boolean;
  readonly highlight?: string;
  readonly badgeKey?: string;
  readonly ctaKey?: string;
}
