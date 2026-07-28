import type { AssistantConversationStatus } from "../value-objects/assistant-conversation-status";
import type { AssistantConversationId } from "../value-objects/assistant-conversation-id";
import type { AssistantConversationTitle } from "../value-objects/assistant-conversation-title";
import { AssistantMessage } from "./assistant-message";

export class AssistantConversation {
  private constructor(
    public readonly id: AssistantConversationId,
    private title: AssistantConversationTitle,
    public readonly status: AssistantConversationStatus,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly lastMessageAt: string | null,
    private messages: AssistantMessage[],
  ) {}

  static create(params: {
    id: AssistantConversationId;
    title: AssistantConversationTitle;
    status: AssistantConversationStatus;
    createdAt: string;
    updatedAt: string;
    lastMessageAt?: string | null;
    messages?: AssistantMessage[];
  }) {
    return new AssistantConversation(
      params.id,
      params.title,
      params.status,
      params.createdAt,
      params.updatedAt,
      params.lastMessageAt ?? null,
      params.messages ?? [],
    );
  }

  rename(title: AssistantConversationTitle) {
    this.title = title;
  }

  archive() {
    return AssistantConversation.create({
      id: this.id,
      title: this.title,
      status: "ARCHIVED",
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastMessageAt: this.lastMessageAt,
      messages: this.messages,
    });
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
