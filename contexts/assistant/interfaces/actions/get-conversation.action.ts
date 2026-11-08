"use server";

import "server-only";
import { composeAssistantAdapters } from "../server/assistant-composition";
import { authorizeAssistantAccess } from "../authorization/assistant-authorization";
import { toConversationViewModel } from "@/contexts/assistant/interfaces/presenters/assistant-chat.presenter.server";
import type { AssistantConversationViewModel } from "@/contexts/assistant/interfaces/view-models/assistant-chat.view-model";

export async function getAssistantConversationAction(
  conversationId: string,
): Promise<AssistantConversationViewModel | null> {
  try {
    const authorization = await authorizeAssistantAccess();
    const conversation = await composeAssistantAdapters(authorization.organizationId).getConversation.handle(
      conversationId,
      authorization.token,
    );
    return toConversationViewModel(conversation);
  } catch {
    return null;
  }
}
