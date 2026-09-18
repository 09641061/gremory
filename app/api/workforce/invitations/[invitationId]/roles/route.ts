import { NextResponse } from "next/server";
import { z } from "zod";

import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-api.gateway";

const bodySchema = z.object({ roleIds: z.array(z.string().uuid()).max(50) });

export async function PUT(request: Request, { params }: { params: Promise<{ invitationId: string }> }) {
  const organizationId = request.headers.get("X-Organization-Id");
  const { invitationId } = await params;
  const body = bodySchema.safeParse(await request.json().catch(() => undefined));
  if (
    !z.string().uuid().safeParse(organizationId).success ||
    !z.string().uuid().safeParse(invitationId).success ||
    !body.success
  ) {
    return NextResponse.json({ message: "A valid organization, invitation, and roles are required" }, { status: 400 });
  }

  try {
    await new WorkforceApiGateway().updateInvitationRoles(organizationId!, invitationId, body.data.roleIds);
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
