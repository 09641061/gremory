import { NextResponse } from "next/server";

import { createFreeAnalyticsQueryService } from "@/contexts/analytics/application/internal/queryservices/free-analytics-query.service";

function routeErrorResponse(error: unknown): Response {
  if (error instanceof Error) {
    const status = (error as Error & { status?: unknown }).status;
    if (typeof status === "number" && !Number.isNaN(status)) {
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
}

export async function freeAnalyticsRoute() {
  try {
    const data = await createFreeAnalyticsQueryService().handle();
    return NextResponse.json(data);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

