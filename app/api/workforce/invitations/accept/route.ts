import { NextResponse } from "next/server";
import { z } from "zod";

import {
  workspaceSelectionCookieOptions,
  workspaceSelectionCookies,
} from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { WorkforceApiGateway } from "@/contexts/workforce/infrastructure/gateways/workforce-api.gateway";

const bodySchema = z.object({ token: z.string().trim().min(1, "Invitation token is required") });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  console.log("Calling Core API...");
  try {
    const acceptance = await new WorkforceApiGateway().acceptInvitation(parsed.data.token);
    const response = NextResponse.json(acceptance);

    // Remember the workspace the invitation joined so the redirect lands inside
    // it instead of the account's previous selection.
    response.cookies.set(
      workspaceSelectionCookies.organizationId,
      acceptance.membership.organizationId,
      workspaceSelectionCookieOptions,
    );
    response.cookies.set(
      workspaceSelectionCookies.establishmentId,
      acceptance.membership.establishmentId,
      workspaceSelectionCookieOptions,
    );

    return response;
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
