import type { BillingPlanReader } from "../../ports/billing-readers-writers";
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
  constructor(private readonly reader: BillingPlanReader) {}

  async getAvailablePlans(currency: CurrencyCode): Promise<PlanReadModel[]> {
    const plans = await this.reader.getPlans(currency);
    return plans.map((plan) => ({ id: plan.id, name: plan.name, description: "", monthlyPriceAmount: plan.monthlyPriceAmount, annualPriceAmount: plan.annualPriceAmount, features: [], isPopular: false, currency: plan.currency, active: plan.active, maxEstablishments: plan.maxEstablishments }));
  }
}

/** Backend Billing owns plan identity, prices, currencies, and availability. */
export async function listPlansByCurrencyQueryService(
  service: ListPlansQueryService,
): Promise<PlansByCurrencyReadModel> {
  const entries = await Promise.all(SUPPORTED_CURRENCIES.map(async ({ code }) => {
    return [code, await service.getAvailablePlans(code)] as const;
  }));
  return Object.fromEntries(entries) as unknown as PlansByCurrencyReadModel;
}
