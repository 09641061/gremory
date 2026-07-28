"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { CreateConversationCommandService } from "@/contexts/assistant/application/internal/commandservices/create-conversation-command.service";
import { SendMessageCommandService } from "@/contexts/assistant/application/internal/commandservices/send-message-command.service";
import type { AssistantConversationReadModel } from "@/contexts/assistant/application/model/assistant.read-models";

import {
  submitAssistantMessageSchema,
  type SubmitAssistantMessageInput,
} from "../rest/schemas/assistant-chat.schemas";

export type SubmitAssistantMessageActionResult =
  | { status: "success"; data: AssistantConversationReadModel; error: null }
  | { status: "error"; data: null; error: string };

export async function submitAssistantMessageAction(
  input: SubmitAssistantMessageInput,
): Promise<SubmitAssistantMessageActionResult> {
  try {
    const parsed = submitAssistantMessageSchema.parse(input);
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

    if (!accessToken) {
      return {
        status: "error",
        data: null,
        error: "You must be signed in to use the assistant.",
      };
    }

    const conversation = parsed.conversationId
      ? await new SendMessageCommandService().handle(
          {
            conversationId: parsed.conversationId,
            message: parsed.message,
          },
          accessToken,
        )
      : await new CreateConversationCommandService().handle(
          {
            messageContent: parsed.message,
          },
          accessToken,
        );

    revalidatePath("/chat");

    return {
      status: "success",
      data: conversation,
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : "Unable to send the assistant message.",
    };
  }
}
