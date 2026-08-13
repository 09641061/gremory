"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { SubmitAssistantMessageCommandService } from "@/contexts/assistant/application/internal/commandservices/submit-assistant-message-command.service";
import { toConversationViewModel } from "@/contexts/assistant/interfaces/presenters/assistant-chat.presenter.server";
import type { AssistantConversationViewModel } from "@/contexts/assistant/interfaces/view-models/assistant-chat.view-model";

import {
  submitAssistantMessageSchema,
  type SubmitAssistantMessageInput,
} from "../rest/schemas/assistant-chat.schemas";

export type SubmitAssistantMessageActionResult =
  | { status: "success"; data: AssistantConversationViewModel; error: null }
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

    const conversation = await new SubmitAssistantMessageCommandService().handle(
      {
        conversationId: parsed.conversationId,
        message: parsed.message,
        establishmentId: parsed.establishmentId,
      },
      accessToken,
    );

    revalidatePath("/chat");

    return {
      status: "success",
      data: toConversationViewModel(conversation)!,
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
