import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiConfig } from "@/api.config";
import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";
import { SendMessageCommandService } from "@/contexts/assistant/application/internal/commandservices/send-message-command.service";
import {
  assistantConversationIdParamSchema,
  assistantConversationMessageSchema,
} from "@/contexts/assistant/interfaces/rest/schemas/assistant-chat.schemas";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const parsedParams = assistantConversationIdParamSchema.safeParse(await params);
    if (!parsedParams.success) return NextResponse.json({ message: "Invalid conversation id" }, { status: 400 });
    const { id } = parsedParams.data;
    const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
    if (!accessToken) return unauthorized();
    const body = assistantConversationMessageSchema.parse(await request.json());

    if (apiConfig.assistant.useStreaming) {
      const gateway = new AssistantApiGateway();
      const backendResponse = await gateway.sendMessageStream(
        id,
        { messageContent: body.message, establishmentId: body.establishmentId },
        accessToken,
        { signal: request.signal },
      );

      if (!backendResponse.ok) {
        throw new Error(await backendResponse.text() || "Failed to initiate stream in backend");
      }

      return new Response(backendResponse.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        },
      });
    }

    const data = await new SendMessageCommandService().handle(
      {
        conversationId: id,
        message: body.message,
        establishmentId: body.establishmentId,
      },
      accessToken,
    );

    return NextResponse.json(data);
  } catch (error) {
    const safe = safePublicError(error, "Failed to process message");
    return NextResponse.json({ message: safe.message }, { status: safe.status });
  }
}
