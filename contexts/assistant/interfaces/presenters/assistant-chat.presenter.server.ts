import type { AssistantConversationReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import type { AssistantConversationViewModel } from "../view-models/assistant-chat.view-model";

export function toConversationViewModel(
  conversation: AssistantConversationReadModel | null,
): AssistantConversationViewModel | null {
  if (!conversation) return null;

  return conversation;
}
