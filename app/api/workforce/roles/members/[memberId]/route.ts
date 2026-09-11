import { NextResponse } from "next/server";
import { z } from "zod";

import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-api.gateway";

const bodySchema = z.object({ roleId: z.string().uuid() });

export async function PUT(request: Request, { params }: { params: Promise<{ memberId: string }> }) {
  const organizationId = request.headers.get("X-Organization-Id");
  const { memberId } = await params;
  const body = bodySchema.safeParse(await request.json().catch(() => undefined));
  if (!z.string().uuid().safeParse(organizationId).success || !z.string().uuid().safeParse(memberId).success || !body.success) {
    return NextResponse.json({ message: "A valid organization, member, and role are required" }, { status: 400 });
  }

  try {
    await new WorkforceApiGateway().assignRole(organizationId!, memberId, body.data.roleId);
    return new NextResponse(null, { status: 204 });
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
