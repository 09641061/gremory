import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { SendMessageCommandService } from "@/contexts/assistant/application/internal/commandservices/send-message-command.service";
import {
  assistantConversationIdParamSchema,
  assistantConversationMessageSchema,
} from "@/contexts/assistant/interfaces/rest/schemas/assistant-chat.schemas";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = assistantConversationIdParamSchema.parse(await params);
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  if (!accessToken) {
    return unauthorized();
  }

  try {
    const body = assistantConversationMessageSchema.parse(await request.json());

    const data = await new SendMessageCommandService().handle(
      {
        conversationId: id,
        message: body.message,
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
