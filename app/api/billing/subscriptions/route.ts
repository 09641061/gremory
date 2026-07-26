import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { BillingApiGateway } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export async function GET() {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscription = await new BillingApiGateway().getCurrentSubscription(accessToken);
    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to retrieve subscription",
      },
      {
        status: error instanceof Error && "status" in error ? (error as { status: number }).status : 500,
      },
    );
  }
}
