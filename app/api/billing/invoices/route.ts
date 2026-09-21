import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { composeBillingAdapters } from "@/contexts/billing/interfaces/server/billing-composition";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { cookies } from "next/headers";
import { requireBillingManager } from "@/contexts/billing/interfaces/authorization/billing-authorization";
import { createCorrelationId } from "@/contexts/shared/infrastructure/http/api-client";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().nonnegative().default(0),
  size: z.coerce.number().int().min(1).max(100).default(20),
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

    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      size: url.searchParams.get("size") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const billingContext = await requireBillingManager(request.headers.get("x-correlation-id") ?? createCorrelationId());
    const invoices = await composeBillingAdapters().invoiceQueryService.getInvoices(
      accessToken,
      parsed.data.page,
      parsed.data.size,
      billingContext,
    );
    return NextResponse.json(invoices);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

function routeErrorResponse(error: unknown, fallback = "Request could not be completed"): Response {
  const safe = safePublicError(error, fallback);
  return NextResponse.json({ message: safe.message }, { status: safe.status });
}
