import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";

import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";

function routeErrorResponse(error: unknown, fallback = "Request could not be completed"): Response {
  const safe = safePublicError(error, fallback);
  return NextResponse.json({ message: safe.message }, { status: safe.status });
}

export async function GET() {
  try {
    const workspace = await composeBusinessAdapters().workspaceReader.fetchResource();
    return NextResponse.json(workspace);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
