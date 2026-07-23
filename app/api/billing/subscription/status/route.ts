import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BillingApiGateway } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { hasActiveSubscription } from "@/contexts/billing/domain/services/subscription-access.policy";

export async function GET() {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return NextResponse.json({ active: false }, { status: 401 });
  }

  try {
    const subscription = await new BillingApiGateway().getCurrentSubscription(accessToken);
    return NextResponse.json({ active: hasActiveSubscription(subscription) });
  } catch {
    // A missing, expired, cancelled, or suspended subscription has no access.
    return NextResponse.json({ active: false });
  }
}
