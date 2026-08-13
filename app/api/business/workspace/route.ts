import { NextResponse } from "next/server";

import { BusinessWorkspaceApiGateway } from "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway";

function routeErrorResponse(error: unknown): Response {
  if (error instanceof Error) {
    const status = (error as Error & { status?: unknown }).status;
    if (typeof status === "number" && !Number.isNaN(status)) {
      return NextResponse.json({ message: error.message }, { status });
    }

    if (error.message === "Authentication is required") {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Unexpected error" }, { status: 500 });
}

export async function GET() {
  try {
    const workspace = await new BusinessWorkspaceApiGateway().getWorkspace();
    return NextResponse.json(workspace);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
