import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { z } from "zod";
import { ListPlansQueryService } from "@/contexts/billing/application/internal/queryservices/list-plans-query.service";

const currencySchema = z.enum(["PEN", "USD", "EUR"]);

function routeErrorResponse(error: unknown, fallback = "Request could not be completed"): Response {
  const safe = safePublicError(error, fallback);
  return NextResponse.json({ message: safe.message }, { status: safe.status });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency");
    const parsedCurrency = currency ? currencySchema.safeParse(currency) : { success: true as const, data: undefined };

    if (!parsedCurrency.success) {
      return NextResponse.json({ message: parsedCurrency.error.issues[0]?.message ?? "Invalid currency" }, { status: 400 });
    }

    const plans = await new ListPlansQueryService().getAvailablePlans(parsedCurrency.data ?? "USD");
    return NextResponse.json(plans);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
