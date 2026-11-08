"use server";

import "server-only";
import { cookies } from "next/headers";

import { composeBillingAdapters } from "@/contexts/billing/interfaces/server/billing-composition";
import type { SubscriptionAccessSnapshot } from "@/contexts/billing/domain/services/subscription-access.policy";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export async function getCurrentSubscriptionAction(): Promise<SubscriptionAccessSnapshot | null> {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (!accessToken) {
    return null;
  }

  return composeBillingAdapters().currentSubscriptionService.getCurrentSubscription(accessToken);
}
