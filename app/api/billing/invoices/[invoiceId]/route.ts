import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import { composeBillingAdapters } from "@/contexts/billing/interfaces/server/billing-composition";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { cookies } from "next/headers";
import { requireBillingManager } from "@/contexts/billing/interfaces/authorization/billing-authorization";
import { createCorrelationId } from "@/contexts/shared/infrastructure/http/api-client";

const uuidSchema = z.string().uuid();

async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(iamSessionCookies.accessToken)?.value;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const { invoiceId } = await params;
    const parsed = uuidSchema.safeParse(invoiceId);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ message: "Authentication is required" }, { status: 401 });
    }

    const billingContext = await requireBillingManager(_request.headers.get("x-correlation-id") ?? createCorrelationId());
    const invoice = await composeBillingAdapters().invoiceQueryService.getInvoiceById(
      accessToken,
      parsed.data,
      billingContext,
    );
    return NextResponse.json(invoice);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

function routeErrorResponse(error: unknown, fallback = "Request could not be completed"): Response {
  const safe = safePublicError(error, fallback);
  return NextResponse.json({ message: safe.message }, { status: safe.status });
}
