import { NextResponse } from "next/server";

import type { GetFreeAnalyticsQuery } from "@/contexts/analytics/domain/model/queries/get-free-analytics.query";
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

export async function freeAnalyticsRoute(query: GetFreeAnalyticsQuery) {
  try {
    const data = await createFreeAnalyticsQueryService().handle(query);
    return NextResponse.json(data);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
