import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import { composeBillingAdapters } from "@/contexts/billing/interfaces/server/billing-composition";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { cookies } from "next/headers";
import { requireBillingManager } from "@/contexts/billing/interfaces/authorization/billing-authorization";
import { createCorrelationId } from "@/contexts/shared/infrastructure/http/api-client";

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

export async function GET(request: Request) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ message: "Authentication is required" }, { status: 401 });
    }

    const billingContext = await requireBillingManager(request.headers.get("x-correlation-id") ?? createCorrelationId());
    const subscription = await composeBillingAdapters().gateway.getCurrentSubscription(accessToken, billingContext);
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

    const billingContext = await requireBillingManager(request.headers.get("x-correlation-id") ?? createCorrelationId());
    const subscription = await composeBillingAdapters().createSubscriptionService.execute(accessToken, {
      planId: parsed.data.planId,
      billingCycle: parsed.data.billingCycle,
      currency: parsed.data.currency,
      successUrl: parsed.data.successUrl,
      cancelUrl: parsed.data.cancelUrl,
    }, billingContext);

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

    const billingContext = await requireBillingManager(request.headers.get("x-correlation-id") ?? createCorrelationId());
    const subscription = await composeBillingAdapters().subscriptionCommandService.renew(accessToken, {
      newPlanId: parsed.data.newPlanId,
      newBillingCycle: parsed.data.newBillingCycle,
    }, billingContext);

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

    const billingContext = await requireBillingManager(createCorrelationId());
    const subscription = await composeBillingAdapters().subscriptionCommandService.cancel(accessToken, billingContext);
    return NextResponse.json(subscription);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
