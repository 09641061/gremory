import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import { createBillingInvoicesAdapter } from "@/contexts/billing/infrastructure/adapters/billing-invoices.adapter";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { cookies } from "next/headers";

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

    const invoice = await createBillingInvoicesAdapter().getInvoiceById(
      accessToken,
      parsed.data,
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
