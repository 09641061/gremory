import type { AssistantConversationReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

export type AssistantMessageViewModel = AssistantConversationReadModel["messages"][number];

export type AssistantConversationViewModel = Omit<AssistantConversationReadModel, "messages"> & {
  messages: AssistantConversationReadModel["messages"];
};
