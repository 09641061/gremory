import "server-only";

import type { AssistantConversationReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import type { AssistantConversationViewModel, AssistantMessageViewModel } from "../view-models/assistant-chat.view-model";

import { renderAssistantMarkdownToHtml } from "./internal/render-assistant-markdown-html.server";

function toMessageViewModel(message: AssistantConversationReadModel["messages"][number]): AssistantMessageViewModel {
  return {
    ...message,
    renderedContentHtml: renderAssistantMarkdownToHtml(message.content),
  };
}

export function toConversationViewModel(
  conversation: AssistantConversationReadModel | null,
): AssistantConversationViewModel | null {
  if (!conversation) return null;

  return {
    ...conversation,
    messages: conversation.messages.map(toMessageViewModel),
  };
}
