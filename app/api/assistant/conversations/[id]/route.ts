import { NextResponse } from "next/server";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";

import {
  assistantConversationIdParamSchema,
  assistantConversationRenameSchema,
} from "@/contexts/assistant/interfaces/rest/schemas/assistant-chat.schemas";
import { authorizeAssistantAccess } from "@/contexts/assistant/interfaces/authorization/assistant-authorization";
import { composeAssistantAdapters } from "@/contexts/assistant/interfaces/server/assistant-composition";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const parsed = assistantConversationIdParamSchema.parse(await params);
    const authorization = await authorizeAssistantAccess();
    const data = await composeAssistantAdapters(authorization.organizationId).getConversation.handle(
      parsed.id,
      authorization.token,
    );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: safePublicError(error, "Failed to fetch conversation").message },
      { status: safePublicError(error, "Failed to fetch conversation").status },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = assistantConversationIdParamSchema.parse(await params);
    const authorization = await authorizeAssistantAccess();
    const body = assistantConversationRenameSchema.parse(await request.json());

    const data = await composeAssistantAdapters(authorization.organizationId).renameConversation.handle(
      {
        conversationId: id,
        title: body.title,
      },
      authorization.token,
    );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: safePublicError(error, "Failed to rename conversation").message },
      { status: safePublicError(error, "Failed to rename conversation").status },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = assistantConversationIdParamSchema.parse(await params);
    const authorization = await authorizeAssistantAccess();
    await composeAssistantAdapters(authorization.organizationId).deleteConversation.handle(
      {
        conversationId: id,
      },
      authorization.token,
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: safePublicError(error, "Failed to delete conversation").message },
      { status: safePublicError(error, "Failed to delete conversation").status },
    );
  }
}
