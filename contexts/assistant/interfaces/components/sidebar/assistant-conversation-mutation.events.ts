import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

export type ConversationMutationEventDetail =
  | { type: "upsert"; conversation: AssistantConversationSummaryReadModel; moveToFront?: boolean }
  | { type: "rename"; conversationId: string; title: string | null }
  | { type: "delete"; conversationId: string };

export function dispatchAssistantConversationMutation(detail: ConversationMutationEventDetail) {
  window.dispatchEvent(
    new CustomEvent<ConversationMutationEventDetail>("assistant-conversations-updated", { detail }),
  );
}
