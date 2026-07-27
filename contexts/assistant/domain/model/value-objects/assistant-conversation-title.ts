export type AssistantConversationTitle = Readonly<{
  value: string;
}>;

export function createAssistantConversationTitle(value: string): AssistantConversationTitle {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error("Title is required");
  }

  if (normalized.length > 200) {
    throw new Error("Title must not exceed 200 characters");
  }

  return Object.freeze({ value: normalized });
}
