"use server";

import { ListPlansQueryService } from "@/contexts/billing/application/internal/queryservices/list-plans-query.service";
import type { PlanReadModel } from "@/contexts/billing/application/internal/queryservices/list-plans-query.service";
import type { CurrencyCode } from "@/contexts/billing/domain/model/value-objects/currency";

export type ListBillingPlansActionResult =
  | { status: "success"; data: PlanReadModel[]; error: null }
  | { status: "error"; data: null; error: string };

export async function listBillingPlansAction(
  currency?: CurrencyCode,
): Promise<ListBillingPlansActionResult> {
  try {
    const plans = new ListPlansQueryService().getAvailablePlans(currency ?? "USD");
    return { status: "success", data: plans, error: null };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : "Failed to load plans",
    };
  }
}
