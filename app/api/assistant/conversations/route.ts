import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return unauthorized();
  }

  try {
    const query = {
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
      size: searchParams.get("size") ? Number(searchParams.get("size")) : 20,
    };
    const data = await new AssistantApiGateway().listConversations(query, accessToken);

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch conversations" },
      { status: error instanceof Error && "status" in error ? (error as { status: number }).status : 500 },
    );
  }
}

export async function POST(request: Request) {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as { title?: string };

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    const data = await new AssistantApiGateway().createConversation({
      title: body.title.trim(),
    }, accessToken);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create conversation" },
      { status: error instanceof Error && "status" in error ? (error as { status: number }).status : 500 },
    );
  }
}



