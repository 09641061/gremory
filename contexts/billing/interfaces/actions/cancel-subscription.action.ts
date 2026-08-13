"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createBillingSubscriptionAdapter, type BillingSubscriptionSnapshot } from "@/contexts/billing/infrastructure/adapters/billing-subscription.adapter";

export type CancelSubscriptionActionResult =
  | { status: "success"; data: BillingSubscriptionSnapshot; error: null }
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

    const result = await createBillingSubscriptionAdapter().cancelSubscription(accessToken);

    revalidatePath("/upgrade");
    revalidatePath("/chat");
    revalidatePath("/schedule");

    return { status: "success", data: result, error: null };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : "An error occurred while cancelling the subscription.",
    };
  }
}
