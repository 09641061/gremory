import { NextResponse } from "next/server";
import { z } from "zod";

import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-api.gateway";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ memberId: string; roleId: string }> },
) {
  const organizationId = request.headers.get("X-Organization-Id");
  const { memberId, roleId } = await params;
  if (
    !z.string().uuid().safeParse(organizationId).success ||
    !z.string().uuid().safeParse(memberId).success ||
    !z.string().uuid().safeParse(roleId).success
  ) {
    return NextResponse.json({ message: "A valid organization, member, and role are required" }, { status: 400 });
  }

  try {
    await new WorkforceApiGateway().removeRoleAssignment(organizationId!, memberId, roleId);
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
