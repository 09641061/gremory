import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import { createBillingSubscriptionAdapter } from "@/contexts/billing/infrastructure/adapters/billing-subscription.adapter";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { cookies } from "next/headers";

const billingCycleSchema = z.enum(["MONTHLY", "ANNUAL"]);
const currencySchema = z.enum(["PEN", "USD", "EUR"]);

const createSubscriptionSchema = z.object({
  planId: z.coerce.number().int().positive("planId must be a positive integer"),
  billingCycle: billingCycleSchema,
  currency: currencySchema.default("USD"),
  successUrl: z.string().min(1).optional(),
  cancelUrl: z.string().min(1).optional(),
});

const renewSubscriptionSchema = z.object({
  newPlanId: z.coerce.number().int().positive().optional(),
  newBillingCycle: billingCycleSchema.optional(),
});

async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(iamSessionCookies.accessToken)?.value;
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ message: "Authentication is required" }, { status: 401 });
    }

    const subscription = await createBillingSubscriptionAdapter().getCurrentSubscription(
      accessToken,
    );
    return NextResponse.json(subscription);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

function validationErrorResponse(message?: string) {
  return NextResponse.json(
    { message: message ?? "Invalid request" },
    { status: 400 },
  );
}

function routeErrorResponse(error: unknown, fallback = "Request could not be completed"): Response {
  const safe = safePublicError(error, fallback);
  return NextResponse.json({ message: safe.message }, { status: safe.status });
}

export async function POST(request: Request) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ message: "Authentication is required" }, { status: 401 });
    }

    const body = await parseJsonBody(request);
    const parsed = createSubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const subscription = await createBillingSubscriptionAdapter().createSubscription(
      accessToken,
      {
        planId: parsed.data.planId,
        billingCycle: parsed.data.billingCycle,
        currency: parsed.data.currency,
        successUrl: parsed.data.successUrl,
        cancelUrl: parsed.data.cancelUrl,
      },
    );

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ message: "Authentication is required" }, { status: 401 });
    }

    const body = await parseJsonBody(request);
    const parsed = renewSubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0]?.message);
    }

    const subscription = await createBillingSubscriptionAdapter().renewSubscription(
      accessToken,
      {
        newPlanId: parsed.data.newPlanId,
        newBillingCycle: parsed.data.newBillingCycle,
      },
    );

    return NextResponse.json(subscription);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function DELETE() {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ message: "Authentication is required" }, { status: 401 });
    }

    const subscription = await createBillingSubscriptionAdapter().cancelSubscription(
      accessToken,
    );
    return NextResponse.json(subscription);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
