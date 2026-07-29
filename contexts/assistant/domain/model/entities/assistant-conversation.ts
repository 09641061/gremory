import type { AssistantConversationId } from "../value-objects/assistant-conversation-id";
import type { AssistantConversationTitle } from "../value-objects/assistant-conversation-title";
import { AssistantMessage } from "./assistant-message";

export class AssistantConversation {
  private constructor(
    public readonly id: AssistantConversationId,
    private title: AssistantConversationTitle,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    private messages: AssistantMessage[],
  ) {}

  static create(params: {
    id: AssistantConversationId;
    title: AssistantConversationTitle;
    createdAt: string;
    updatedAt: string;
    messages?: AssistantMessage[];
  }) {
    return new AssistantConversation(
      params.id,
      params.title,
      params.createdAt,
      params.updatedAt,
      params.messages ?? [],
    );
  }

  rename(title: AssistantConversationTitle) {
    this.title = title;
  }

  addMessage(message: AssistantMessage) {
    this.messages = [...this.messages, message];
  }

  getTitle() {
    return this.title.value;
  }

  getMessages() {
    return [...this.messages];
  }
}
