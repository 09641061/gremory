"use server";

import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import "server-only";
import { revalidatePath } from "next/cache";

import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { authorizeAssistantAccess } from "../authorization/assistant-authorization";
import { composeAssistantAdapters } from "../server/assistant-composition";

import {
  assistantConversationIdParamSchema,
  assistantConversationRenameSchema,
  type AssistantConversationIdParamInput,
  type AssistantConversationRenameInput,
} from "../rest/schemas/assistant-chat.schemas";

export type RenameAssistantConversationActionResult =
  | { status: "success"; data: AssistantConversationSummaryReadModel; error: null }
  | { status: "error"; data: null; error: string };

export type DeleteAssistantConversationActionResult =
  | { status: "success"; data: { conversationId: string }; error: null }
  | { status: "error"; data: null; error: string };

function toSummaryReadModel(conversation: {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}): AssistantConversationSummaryReadModel {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

export async function renameAssistantConversationAction(
  input: AssistantConversationRenameInput & AssistantConversationIdParamInput,
): Promise<RenameAssistantConversationActionResult> {
  try {
    const parsed = {
      ...assistantConversationIdParamSchema.parse({ id: input.id }),
      ...assistantConversationRenameSchema.parse({ title: input.title }),
    };
    const authorization = await authorizeAssistantAccess();
    const adapters = composeAssistantAdapters(authorization.organizationId);
    const conversation = await adapters.renameConversation.handle(
      {
        conversationId: parsed.id,
        title: parsed.title,
      },
      authorization.token,
    );

    revalidatePath("/chat");

    return {
      status: "success",
      data: toSummaryReadModel(conversation),
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: safePublicError(error, "Unable to rename the assistant conversation.").message,
    };
  }
}

export async function deleteAssistantConversationAction(
  input: AssistantConversationIdParamInput,
): Promise<DeleteAssistantConversationActionResult> {
  try {
    const parsed = assistantConversationIdParamSchema.parse({ id: input.id });
    const authorization = await authorizeAssistantAccess();
    const adapters = composeAssistantAdapters(authorization.organizationId);
    await adapters.deleteConversation.handle(
      { conversationId: parsed.id },
      authorization.token,
    );

    revalidatePath("/chat");

    return {
      status: "success",
      data: { conversationId: parsed.id },
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: safePublicError(error, "Unable to delete the assistant conversation.").message,
    };
  }
}
