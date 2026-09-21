import "server-only";

import { BillingApiGateway } from "../../../infrastructure/gateways/billing-api.gateway";
import { SUPPORTED_CURRENCIES, type CurrencyCode } from "../../../domain/model/value-objects/currency";

export interface PlanReadModel {
  id: number;
  name: string;
  description: string;
  monthlyPriceAmount: number;
  annualPriceAmount: number;
  features: readonly string[];
  isPopular: boolean;
  currency: string;
  active: boolean;
  maxEstablishments: number;
}

export type PlansByCurrencyReadModel = Readonly<Record<CurrencyCode, PlanReadModel[]>>;

/** Compatibility query facade for the retained public plans handler. */
export class ListPlansQueryService {
  async getAvailablePlans(currency: CurrencyCode): Promise<PlanReadModel[]> {
    const gateway = new BillingApiGateway();
    const plans = await gateway.getPlans(currency);
    return plans.map((plan) => ({ id: plan.id, name: plan.name, description: "", monthlyPriceAmount: plan.monthlyPriceAmount, annualPriceAmount: plan.annualPriceAmount, features: [], isPopular: false, currency: plan.currency, active: plan.active, maxEstablishments: plan.maxEstablishments }));
  }
}

/** Backend Billing owns plan identity, prices, currencies, and availability. */
export async function listPlansByCurrencyQueryService(): Promise<PlansByCurrencyReadModel> {
  const entries = await Promise.all(SUPPORTED_CURRENCIES.map(async ({ code }) => {
    return [code, await new ListPlansQueryService().getAvailablePlans(code)] as const;
  }));
  return Object.fromEntries(entries) as unknown as PlansByCurrencyReadModel;
}
