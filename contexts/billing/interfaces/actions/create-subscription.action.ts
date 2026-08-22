"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createBillingSubscriptionAdapter, type BillingSubscriptionSnapshot } from "@/contexts/billing/infrastructure/adapters/billing-subscription.adapter";
import { CreateSubscriptionCommandService } from "../../application/internal/commandservices/create-subscription-command.service";
import type { BillingCycleType } from "../../domain/model/value-objects/billing-cycle";
import type { CurrencyCode } from "../../domain/model/value-objects/currency";

export type CreateSubscriptionActionResult =
  | { status: "success"; data: BillingSubscriptionSnapshot; error: null }
  | { status: "error"; data: null; error: string };

export interface CreateSubscriptionInput {
  planId: number;
  billingCycle: BillingCycleType;
  currency?: CurrencyCode;
}

/**
 * Server action to initiate plan subscription creation calling the backend API.
 */
export async function createSubscriptionAction(
  input: CreateSubscriptionInput,
): Promise<CreateSubscriptionActionResult> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

    if (!accessToken) {
      return {
        status: "error",
        data: null,
        error: "You must be signed in to select a subscription plan.",
      };
    }

    const prepared = new CreateSubscriptionCommandService().handle({
      planId: input.planId,
      billingCycle: input.billingCycle,
      currency: input.currency,
    });
    const result = await createBillingSubscriptionAdapter().createSubscription(accessToken, prepared);

    revalidatePath("/upgrade");
    revalidatePath("/chat");
    revalidatePath("/schedule");
    revalidatePath("/invoices");

    return { status: "success", data: result, error: null };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : "An error occurred while processing the plan selection.",
    };
  }
}
