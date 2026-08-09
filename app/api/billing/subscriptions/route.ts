import { NextResponse } from "next/server";
import { z } from "zod";
import { createBillingSubscriptionOutboundService } from "@/contexts/billing/application/internal/outboundservices/billing-subscription-outbound.service";
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

    const subscription = await createBillingSubscriptionOutboundService().getCurrentSubscription(
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

function routeErrorResponse(error: unknown): Response {
  if (error instanceof Error) {
    const status = readStatus(error);
    if (status !== undefined) {
      const details = readDetails(error);
      return NextResponse.json(
        details === undefined
          ? { message: error.message }
          : { message: error.message, details },
        { status },
      );
    }

    if (error.message === "Authentication is required") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
}

function readStatus(error: Error): number | undefined {
  const status = (error as Error & { status?: unknown }).status;
  if (typeof status !== "number" || Number.isNaN(status)) return undefined;
  if (status <= 0) return 502;
  return status;
}

function readDetails(error: Error): unknown {
  return (error as Error & { details?: unknown }).details;
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

    const subscription = await createBillingSubscriptionOutboundService().createSubscription(
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

    const subscription = await createBillingSubscriptionOutboundService().renewSubscription(
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

    const subscription = await createBillingSubscriptionOutboundService().cancelSubscription(
      accessToken,
    );
    return NextResponse.json(subscription);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
