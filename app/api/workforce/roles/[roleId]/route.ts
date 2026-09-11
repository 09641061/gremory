import { NextResponse } from "next/server";
import { z } from "zod";

import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-api.gateway";
import { updateWorkforceRoleSchema } from "@/contexts/workforce/interfaces/rest/schemas/workforce-member.schemas";

export async function PATCH(request: Request, { params }: { params: Promise<{ roleId: string }> }) {
  const organizationId = request.headers.get("X-Organization-Id");
  const { roleId } = await params;
  if (!z.string().uuid().safeParse(organizationId).success || !z.string().uuid().safeParse(roleId).success) {
    return NextResponse.json({ message: "A valid organization and role are required" }, { status: 400 });
  }

  const parsed = updateWorkforceRoleSchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });

  try {
    const role = await new WorkforceApiGateway().updateRole(organizationId!, roleId, parsed.data);
    return NextResponse.json(role);
  } catch (error) {
    return roleErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ roleId: string }> }) {
  const organizationId = request.headers.get("X-Organization-Id");
  const { roleId } = await params;
  if (!z.string().uuid().safeParse(organizationId).success || !z.string().uuid().safeParse(roleId).success) {
    return NextResponse.json({ message: "A valid organization and role are required" }, { status: 400 });
  }

  try {
    await new WorkforceApiGateway().deleteRole(organizationId!, roleId);
    return new NextResponse(null, { status: 204 });
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
