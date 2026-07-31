import type {
  AssistantConversationReadModel,
  AssistantMessageReadModel,
} from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

export type AssistantMessageViewModel = AssistantMessageReadModel & {
  renderedContentHtml: string;
};

export type AssistantConversationViewModel = Omit<AssistantConversationReadModel, "messages"> & {
  messages: AssistantMessageViewModel[];
};
