import { NextResponse } from "next/server";
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
