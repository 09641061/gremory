"use server";

import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import type { BillingSubscriptionReadModel } from "../../application/ports/billing-readers-writers";
import { composeBillingAdapters } from "../server/billing-composition";
import { requireBillingManager } from "../authorization/billing-authorization";

export type CancelSubscriptionActionResult =
  | { status: "success"; data: BillingSubscriptionReadModel; error: null }
  | { status: "error"; data: null; error: string };

/**
 * Server action to cancel the active paid subscription plan.
 */
export async function cancelSubscriptionAction(): Promise<CancelSubscriptionActionResult> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

    if (!accessToken) {
      return {
        status: "error",
        data: null,
        error: "You must be signed in to cancel your subscription.",
      };
    }

    const billingContext = await requireBillingManager();
    const result = await composeBillingAdapters().subscriptionCommandService.cancel(accessToken, billingContext);

    try {
      revalidatePath("/upgrade");
      revalidatePath("/chat");
      revalidatePath("/schedule");
      revalidatePath("/invoice");
    } catch {
      // A confirmed cancellation remains successful if cache invalidation fails.
    }

    return { status: "success", data: result, error: null };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: safePublicError(error, "An error occurred while cancelling the subscription.").message,
    };
  }
}
