"use server";

import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import "server-only";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import type { BillingSubscriptionReadModel } from "../../application/ports/billing-readers-writers";
import { composeBillingAdapters } from "../server/billing-composition";
import { requireBillingManager } from "../authorization/billing-authorization";
import type { BillingCycleType } from "../../domain/model/value-objects/billing-cycle";
import type { CurrencyCode } from "../../domain/model/value-objects/currency";

export type CreateSubscriptionActionResult =
  | { status: "success"; data: BillingSubscriptionReadModel; error: null }
  | { status: "error"; data: null; error: string };

const createSubscriptionInputSchema = z.object({
  planId: z.number().int().positive(),
  billingCycle: z.enum(["MONTHLY", "ANNUAL"]),
  currency: z.enum(["USD", "PEN", "EUR"]).optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionInputSchema> & {
  billingCycle: BillingCycleType;
  currency?: CurrencyCode;
};

/**
 * Server action to initiate plan subscription creation calling the backend API.
 */
export async function createSubscriptionAction(
  input: CreateSubscriptionInput,
): Promise<CreateSubscriptionActionResult> {
  try {
    const parsed = createSubscriptionInputSchema.safeParse(input);
    if (!parsed.success) {
      return { status: "error", data: null, error: "Invalid subscription selection." };
    }
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

    if (!accessToken) {
      return {
        status: "error",
        data: null,
        error: "You must be signed in to select a subscription plan.",
      };
    }

    const billingContext = await requireBillingManager();
    const result = await composeBillingAdapters().createSubscriptionService.execute(accessToken, {
      planId: parsed.data.planId,
      billingCycle: parsed.data.billingCycle as BillingCycleType,
      currency: parsed.data.currency as CurrencyCode | undefined,
    }, billingContext);

    try {
      revalidatePath("/upgrade");
      revalidatePath("/chat");
      revalidatePath("/schedule");
      revalidatePath("/invoice");
    } catch {
      // A confirmed subscription change remains successful if cache invalidation fails.
    }

    return { status: "success", data: result, error: null };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: safePublicError(error, "An error occurred while processing the plan selection.").message,
    };
  }
}
