"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { RenameConversationCommandService } from "@/contexts/assistant/application/internal/commandservices/rename-conversation-command.service";
import { DeleteConversationCommandService } from "@/contexts/assistant/application/internal/commandservices/delete-conversation-command.service";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

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

async function resolveAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(iamSessionCookies.accessToken)?.value;
}

export async function renameAssistantConversationAction(
  input: AssistantConversationRenameInput & AssistantConversationIdParamInput,
): Promise<RenameAssistantConversationActionResult> {
  try {
    const parsed = {
      ...assistantConversationIdParamSchema.parse({ id: input.id }),
      ...assistantConversationRenameSchema.parse({ title: input.title }),
    };
    const accessToken = await resolveAccessToken();

    if (!accessToken) {
      return {
        status: "error",
        data: null,
        error: "You must be signed in to use the assistant.",
      };
    }

    const conversation = await new RenameConversationCommandService().handle(
      {
        conversationId: parsed.id,
        title: parsed.title,
      },
      accessToken,
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
      error: error instanceof Error ? error.message : "Unable to rename the assistant conversation.",
    };
  }
}

export async function deleteAssistantConversationAction(
  input: AssistantConversationIdParamInput,
): Promise<DeleteAssistantConversationActionResult> {
  try {
    const parsed = assistantConversationIdParamSchema.parse({ id: input.id });
    const accessToken = await resolveAccessToken();

    if (!accessToken) {
      return {
        status: "error",
        data: null,
        error: "You must be signed in to use the assistant.",
      };
    }

    await new DeleteConversationCommandService().handle(
      { conversationId: parsed.id },
      accessToken,
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
      error: error instanceof Error ? error.message : "Unable to delete the assistant conversation.",
    };
  }
}
