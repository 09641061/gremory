import { NextResponse } from "next/server";
import { z } from "zod";

import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-api.gateway";

const querySchema = z.object({
  page: z.coerce.number().int().nonnegative().default(0),
  size: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: Request) {
  const organizationId = request.headers.get("X-Organization-Id");
  if (!organizationId || !z.string().uuid().safeParse(organizationId).success) {
    return NextResponse.json({ message: "A valid organization context is required" }, { status: 400 });
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    size: url.searchParams.get("size") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  try {
    const page = await new WorkforceApiGateway().listMembers(
      organizationId,
      parsed.data.page,
      parsed.data.size,
    );
    return NextResponse.json(page);
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
