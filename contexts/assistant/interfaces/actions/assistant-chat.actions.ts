"use server";

import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import "server-only";
import { revalidatePath } from "next/cache";

import { authorizeAssistantAccess } from "../authorization/assistant-authorization";
import { composeAssistantAdapters } from "../server/assistant-composition";
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
    const authorization = await authorizeAssistantAccess(parsed.establishmentId);
    const adapters = composeAssistantAdapters(authorization.organizationId);
    const conversation = await adapters.submitAssistantMessage.handle(
      {
        conversationId: parsed.conversationId,
        message: parsed.message,
        establishmentId: parsed.establishmentId,
      },
      authorization.token,
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
      error: safePublicError(error, "Unable to send the assistant message.").message,
    };
  }
}
