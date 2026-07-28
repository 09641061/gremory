import "server-only";

import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

import { createAssistantConversationId } from "../../../domain/model/value-objects/assistant-conversation-id";
import type { DeleteConversationCommand } from "../../../domain/model/commands/delete-conversation.command";

export class DeleteConversationCommandService {
  constructor(private readonly gateway = new AssistantApiGateway()) {}

  async handle(command: DeleteConversationCommand, token?: string): Promise<void> {
    const conversationId = createAssistantConversationId(command.conversationId).value;
    await this.gateway.deleteConversation(conversationId, token);
  }
}
