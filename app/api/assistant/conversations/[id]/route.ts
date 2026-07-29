import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { DeleteConversationCommandService } from "@/contexts/assistant/application/internal/commandservices/delete-conversation-command.service";
import { RenameConversationCommandService } from "@/contexts/assistant/application/internal/commandservices/rename-conversation-command.service";
import { GetConversationQueryService } from "@/contexts/assistant/application/internal/queryservices/get-conversation-query.service";
import {
  assistantConversationIdParamSchema,
  assistantConversationRenameSchema,
} from "@/contexts/assistant/interfaces/rest/schemas/assistant-chat.schemas";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = assistantConversationIdParamSchema.parse(await params);
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return unauthorized();
  }

  try {
    const data = await new GetConversationQueryService().handle(id, accessToken);
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
  const { id } = assistantConversationIdParamSchema.parse(await params);
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return unauthorized();
  }

  try {
    const body = assistantConversationRenameSchema.parse(await request.json());

    const data = await new RenameConversationCommandService().handle(
      {
        conversationId: id,
        title: body.title,
      },
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
  const { id } = assistantConversationIdParamSchema.parse(await params);
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return unauthorized();
  }

  try {
    await new DeleteConversationCommandService().handle(
      {
        conversationId: id,
      },
      accessToken,
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete conversation" },
      { status: error instanceof Error && "status" in error ? (error as { status: number }).status : 500 },
    );
  }
}
