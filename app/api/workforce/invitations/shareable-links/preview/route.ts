import { NextResponse } from "next/server";

import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-api.gateway";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ message: "An invitation token is required" }, { status: 400 });
  }

  try {
    const preview = await new WorkforceApiGateway().previewShareableInvitationLink(token);
    return NextResponse.json(preview);
  } catch (error) {
    return errorResponse(error);
  }
}

function errorResponse(error: unknown): Response {
  if (error instanceof Error && "status" in error && typeof error.status === "number") {
    return NextResponse.json({ message: error.message }, { status: error.status || 502 });
  }
  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Unexpected error" },
    { status: error instanceof Error && error.message === "Authentication is required" ? 401 : 500 },
  );
}
