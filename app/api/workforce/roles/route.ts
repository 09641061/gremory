import { NextResponse } from "next/server";
import { z } from "zod";

import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-api.gateway";
import { createWorkforceRoleSchema } from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

export async function GET(request: Request) {
  const organizationId = request.headers.get("X-Organization-Id");
  if (!z.string().uuid().safeParse(organizationId).success) {
    return NextResponse.json({ message: "A valid organization context is required" }, { status: 400 });
  }

  try {
    return NextResponse.json(await new WorkforceApiGateway().listRoles(organizationId!));
  } catch (error) {
    if (error instanceof Error && "status" in error && typeof error.status === "number") {
      return NextResponse.json({ message: error.message }, { status: error.status || 502 });
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected error" },
      { status: error instanceof Error && error.message === "Authentication is required" ? 401 : 500 },
    );
  }
}

export async function POST(request: Request) {
  const organizationId = request.headers.get("X-Organization-Id");
  if (!z.string().uuid().safeParse(organizationId).success) {
    return NextResponse.json({ message: "A valid organization context is required" }, { status: 400 });
  }

  const parsed = createWorkforceRoleSchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });

  try {
    const gateway = new WorkforceApiGateway();
    const created = await gateway.createRole(organizationId!, parsed.data.name);
    return NextResponse.json(
      parsed.data.permissions.length > 0
        ? await gateway.updateRole(organizationId!, created.id, parsed.data)
        : created,
      { status: 201 },
    );
  } catch (error) {
    return roleErrorResponse(error);
  }
}

function roleErrorResponse(error: unknown): Response {
  if (error instanceof Error && "status" in error && typeof error.status === "number") {
    return NextResponse.json({ message: error.message }, { status: error.status || 502 });
  }
  return NextResponse.json(
    { message: error instanceof Error ? error.message : "Unexpected error" },
    { status: error instanceof Error && error.message === "Authentication is required" ? 401 : 500 },
  );
}
