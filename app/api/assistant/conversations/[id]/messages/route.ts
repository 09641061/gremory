import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as { message?: string };

    if (!body.message || !body.message.trim()) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    const data = await new AssistantApiGateway().sendMessage(
      id,
      {
        message: body.message.trim(),
      },
      accessToken,
    );

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to send message" },
      { status: error instanceof Error && "status" in error ? (error as { status: number }).status : 500 },
    );
  }
}
