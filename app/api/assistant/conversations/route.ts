import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { CreateConversationCommandService } from "@/contexts/assistant/application/internal/commandservices/create-conversation-command.service";
import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import {
  assistantConversationCreateSchema,
  assistantConversationListQuerySchema,
} from "@/contexts/assistant/interfaces/rest/schemas/assistant-chat.schemas";
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
    const query = assistantConversationListQuerySchema.parse({
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      size: searchParams.get("size") ?? undefined,
    });
    const data = await new ListConversationsQueryService().handle(query, accessToken);

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
    const body = assistantConversationCreateSchema.parse(await request.json());

    const data = await new CreateConversationCommandService().handle(
      {
        messageContent: body.messageContent,
        establishmentId: body.establishmentId,
      },
      accessToken,
    );

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to create conversation" },
      { status: error instanceof Error && "status" in error ? (error as { status: number }).status : 500 },
    );
  }
}


