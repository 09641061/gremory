import { NextResponse } from "next/server";
import { createBillingInvoicesOutboundService } from "@/contexts/billing/application/internal/outboundservices/billing-invoices-outbound.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { cookies } from "next/headers";
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

    const invoices = await createBillingInvoicesOutboundService().getInvoices(
      accessToken,
      parsed.data.page,
      parsed.data.size,
    );
    return NextResponse.json(invoices);
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
