"use server";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { BillingApiGateway, type SubscriptionResponse } from "../../infrastructure/gateways/billing-api.gateway";
import type { BillingCycleType } from "../../domain/model/value-objects/billing-cycle";
import type { CurrencyCode } from "../../domain/model/value-objects/currency";

export type CreateSubscriptionActionResult =
  | { status: "success"; data: SubscriptionResponse; error: null }
  | { status: "error"; data: null; error: string };

export interface CreateSubscriptionInput {
  planId: number;
  billingCycle: BillingCycleType;
  currency: CurrencyCode;
}

/**
 * Server action to initiate plan subscription creation calling the backend API.
 */
export async function createSubscriptionAction(
  input: CreateSubscriptionInput
): Promise<CreateSubscriptionActionResult> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

    if (!accessToken) {
      return {
        status: "error",
        data: null,
        error: "Debes iniciar sesión para seleccionar un plan de suscripción.",
      };
    }

    const gateway = new BillingApiGateway();
    const result = await gateway.createSubscription(accessToken, {
      ownerId: "",
      planId: input.planId,
      billingCycle: input.billingCycle,
      currency: input.currency,
    });

    return { status: "success", data: result, error: null };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : "Error al procesar la selección del plan",
    };
  }
}
