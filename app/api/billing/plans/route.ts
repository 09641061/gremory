import { NextResponse } from "next/server";
import { z } from "zod";

import { BillingApiGateway } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";

const currencySchema = z.enum(["PEN", "USD", "EUR"]);

function routeErrorResponse(error: unknown): Response {
  if (error instanceof Error) {
    const status = (error as Error & { status?: unknown }).status;
    if (typeof status === "number" && !Number.isNaN(status)) {
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency");
    const parsedCurrency = currency ? currencySchema.safeParse(currency) : { success: true as const, data: undefined };

    if (!parsedCurrency.success) {
      return NextResponse.json({ message: parsedCurrency.error.issues[0]?.message ?? "Invalid currency" }, { status: 400 });
    }

    const plans = await new BillingApiGateway().getPlans(parsedCurrency.data);
    return NextResponse.json(plans);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
