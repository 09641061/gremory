export type AssistantConversationId = Readonly<{
  value: string;
}>;

export function createAssistantConversationId(value: string): AssistantConversationId {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error("Conversation id is required");
  }

  return Object.freeze({ value: normalized });
}
