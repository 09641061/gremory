export type AssistantMessageContent = Readonly<{
  value: string;
}>;

export function createAssistantMessageContent(value: string): AssistantMessageContent {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error("Message is required");
  }

  return Object.freeze({ value: normalized });
}
