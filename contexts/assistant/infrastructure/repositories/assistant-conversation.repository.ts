import "server-only";

import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

import { AssistantConversation } from "@/contexts/assistant/domain/model/entities/assistant-conversation";
import { AssistantMessage } from "@/contexts/assistant/domain/model/entities/assistant-message";
import type { AssistantMessageRole } from "@/contexts/assistant/domain/model/value-objects/assistant-message-role";
import { createAssistantConversationId } from "@/contexts/assistant/domain/model/value-objects/assistant-conversation-id";
import { createAssistantConversationTitle } from "@/contexts/assistant/domain/model/value-objects/assistant-conversation-title";
import { createAssistantMessageContent } from "@/contexts/assistant/domain/model/value-objects/assistant-message-content";
import type { AssistantConversationRepository } from "@/contexts/assistant/domain/model/repositories/assistant-conversation.repository";
import type { AssistantConversationResponse, AssistantMessageRole as ApiMessageRole } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

function toAssistantMessageRole(role: ApiMessageRole): AssistantMessageRole {
  const normalized = String(role ?? "").toUpperCase();
  return normalized === "ASSISTANT" || normalized === "AGENT" ? "ASSISTANT" : "USER";
}

function toAssistantConversationEntity(conversation: AssistantConversationResponse): AssistantConversation {
  return AssistantConversation.create({
    id: createAssistantConversationId(conversation.id),
    title: createAssistantConversationTitle(conversation.title || "Nueva conversacion"),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messages: conversation.messages.map((message) =>
      AssistantMessage.create({
        id: message.id,
        role: toAssistantMessageRole(message.role),
        content: createAssistantMessageContent(message.content).value,
        intent: null,
        createdAt: message.createdAt,
      }),
    ),
  });
}

export class AssistantConversationRepositoryImpl implements AssistantConversationRepository {
  constructor(private readonly gateway = new AssistantApiGateway()) {}

  async getConversation(conversationId: string, token?: string): Promise<AssistantConversation> {
    const conversation = await this.gateway.getConversation(conversationId, token);
    return toAssistantConversationEntity(conversation);
  }

  async createConversation(command: { messageContent: string }, token?: string): Promise<AssistantConversation> {
    const conversation = await this.gateway.createConversation(command, token);
    return toAssistantConversationEntity(conversation);
  }

  async sendMessage(command: { conversationId: string; message: string }, token?: string): Promise<AssistantConversation> {
    const conversation = await this.gateway.sendMessage(
      command.conversationId,
      { messageContent: command.message },
      token,
    );
    return toAssistantConversationEntity(conversation);
  }

  async renameConversation(
    command: { conversationId: string; title: string },
    token?: string,
  ): Promise<AssistantConversation> {
    const conversation = await this.gateway.renameConversation(
      command.conversationId,
      { title: command.title },
      token,
    );
    return toAssistantConversationEntity(conversation);
  }

  async deleteConversation(command: { conversationId: string }, token?: string): Promise<void> {
    await this.gateway.deleteConversation(command.conversationId, token);
  }
}
