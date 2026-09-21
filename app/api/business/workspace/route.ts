import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";

import { BusinessWorkspaceApiGateway } from "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway";

function routeErrorResponse(error: unknown, fallback = "Request could not be completed"): Response {
  const safe = safePublicError(error, fallback);
  return NextResponse.json({ message: safe.message }, { status: safe.status });
}

export async function GET() {
  try {
    const workspace = await new BusinessWorkspaceApiGateway().getWorkspace();
    return NextResponse.json(workspace);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
