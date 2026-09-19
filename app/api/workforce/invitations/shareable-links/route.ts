import { NextResponse } from "next/server";
import { z } from "zod";

import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-api.gateway";

const bodySchema = z.object({
  establishmentIds: z.array(z.string().uuid()).min(1, "Select at least one establishment"),
  roleIds: z.array(z.string().uuid()).max(50).optional().default([]),
  expiration: z.enum(["ONE_HOUR", "ONE_DAY", "SEVEN_DAYS", "THIRTY_DAYS"]),
});

export async function GET(request: Request) {
  const organizationId = request.headers.get("X-Organization-Id");
  if (!z.string().uuid().safeParse(organizationId).success) {
    return NextResponse.json({ message: "A valid organization context is required" }, { status: 400 });
  }

  try {
    const links = await new WorkforceApiGateway().listShareableInvitationLinks(organizationId!);
    return NextResponse.json(links);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const organizationId = request.headers.get("X-Organization-Id");
  if (!z.string().uuid().safeParse(organizationId).success) {
    return NextResponse.json({ message: "A valid organization context is required" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  try {
    const link = await new WorkforceApiGateway().createShareableInvitationLink(organizationId!, parsed.data);
    return NextResponse.json(link, { status: 201 });
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
