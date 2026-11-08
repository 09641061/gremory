"use server";

import "server-only";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import type { BillingSubscriptionReadModel } from "../../application/ports/billing-readers-writers";
import type { BillingCycleType } from "../../domain/model/value-objects/billing-cycle";
import type { CurrencyCode } from "../../domain/model/value-objects/currency";
import { requireSubscriptionOwnerAccess } from "../authorization/billing-authorization";
import { composeBillingAdapters } from "../server/billing-composition";

export type CreateSubscriptionActionErrorKind =
  | "authentication"
  | "authorization"
  | "validation"
  | "operation";

export type CreateSubscriptionActionResult =
  | {
      status: "success";
      data: BillingSubscriptionReadModel;
      error: null;
      errorKind: null;
    }
  | {
      status: "error";
      data: null;
      error: string;
      errorKind: CreateSubscriptionActionErrorKind;
    };

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
 * Server action for the account-level subscription checkout boundary.
 * Organization ownership is resolved by the server-side authorization ACL;
 * client input contains only the selected plan, cycle, and currency.
 */
export async function createSubscriptionAction(
  input: CreateSubscriptionInput,
): Promise<CreateSubscriptionActionResult> {
  try {
    const parsed = createSubscriptionInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        status: "error",
        data: null,
        error: "Invalid subscription selection.",
        errorKind: "validation",
      };
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

    if (!accessToken) {
      return {
        status: "error",
        data: null,
        error: "You must be signed in to select a subscription plan.",
        errorKind: "authentication",
      };
    }

    const billingContext = await requireSubscriptionOwnerAccess();
    const result = await composeBillingAdapters().createSubscriptionService.execute(
      accessToken,
      {
        planId: parsed.data.planId,
        billingCycle: parsed.data.billingCycle as BillingCycleType,
        currency: parsed.data.currency as CurrencyCode | undefined,
      },
      billingContext,
    );

    try {
      revalidatePath("/upgrade");
      revalidatePath("/chat");
      revalidatePath("/schedule");
      revalidatePath("/invoice");
    } catch {
      // A confirmed subscription change remains successful if cache invalidation fails.
    }

    return { status: "success", data: result, error: null, errorKind: null };
  } catch (error) {
    const safe = safePublicError(error, "An error occurred while processing the plan selection.");
    return {
      status: "error",
      data: null,
      error: safe.message,
      errorKind: toActionErrorKind(safe.status),
    };
  }
}

function toActionErrorKind(status: number): CreateSubscriptionActionErrorKind {
  if (status === 401) return "authentication";
  if (status === 403) return "authorization";
  return "operation";
}
