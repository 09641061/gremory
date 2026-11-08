import { NextResponse } from "next/server";
import { apiConfig } from "@/api.config";
import { composeAssistantAdapters } from "@/contexts/assistant/interfaces/server/assistant-composition";
import { createValidatedAssistantSseStream } from "@/contexts/assistant/interfaces/sse/assistant-sse-contract";
import {
  assistantConversationIdParamSchema,
  assistantConversationMessageSchema,
} from "@/contexts/assistant/interfaces/rest/schemas/assistant-chat.schemas";
import { authorizeAssistantAccess } from "@/contexts/assistant/interfaces/authorization/assistant-authorization";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const parsedParams = assistantConversationIdParamSchema.safeParse(await params);
    if (!parsedParams.success) return NextResponse.json({ message: "Invalid conversation id" }, { status: 400 });
    const { id } = parsedParams.data;
    const body = assistantConversationMessageSchema.parse(await request.json());
    const authorization = await authorizeAssistantAccess(body.establishmentId);

    if (apiConfig.assistant.useStreaming) {
      const backendResponse = await composeAssistantAdapters(authorization.organizationId).gateway.sendMessageStream(
        id,
        { messageContent: body.message, establishmentId: body.establishmentId },
        authorization.token,
        { signal: request.signal },
      );

      if (!backendResponse.ok || !backendResponse.body) {
        throw new Error("Failed to initiate assistant stream in backend");
      }

      return new Response(createValidatedAssistantSseStream(backendResponse.body), {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const data = await composeAssistantAdapters(authorization.organizationId).sendMessage.handle(
      {
        conversationId: id,
        message: body.message,
        establishmentId: body.establishmentId,
      },
      authorization.token,
    );

    return NextResponse.json(data);
  } catch (error) {
    const safe = safePublicError(error, "Failed to process message");
    return NextResponse.json({ message: safe.message }, { status: safe.status });
  }
}
