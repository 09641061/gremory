import { NextResponse } from "next/server";
import { z } from "zod";

import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-api.gateway";

const bodySchema = z.object({ token: z.string().trim().min(1, "An invitation token is required") });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  try {
    await new WorkforceApiGateway().acceptShareableInvitationLink(parsed.data.token);
    return new NextResponse(null, { status: 204 });
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
