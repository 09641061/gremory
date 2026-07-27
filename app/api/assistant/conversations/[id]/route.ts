import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return unauthorized();
  }

  try {
    const data = await new AssistantApiGateway().getConversation(id, accessToken);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch conversation" },
      { status: error instanceof Error && "status" in error ? (error as { status: number }).status : 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as { title?: string };
    const title = body.title?.trim();

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }
    if (title.length > 200) {
      return NextResponse.json(
        { message: "Title must not exceed 200 characters" },
        { status: 400 },
      );
    }

    const data = await new AssistantApiGateway().renameConversation(
      id,
      { title },
      accessToken,
    );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to rename conversation" },
      { status: error instanceof Error && "status" in error ? (error as { status: number }).status : 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return unauthorized();
  }

  try {
    await new AssistantApiGateway().deleteConversation(id, accessToken);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete conversation" },
      { status: error instanceof Error && "status" in error ? (error as { status: number }).status : 500 },
    );
  }
}
