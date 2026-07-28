import "server-only";

import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

import { createAssistantConversationId } from "../../../domain/model/value-objects/assistant-conversation-id";
import type { ArchiveConversationCommand } from "../../../domain/model/commands/archive-conversation.command";
import type { AssistantConversationReadModel } from "../../model/assistant.read-models";
import { toConversationReadModel } from "../transforms/assistant-conversation.transform";

export class ArchiveConversationCommandService {
  constructor(private readonly gateway = new AssistantApiGateway()) {}

  async handle(command: ArchiveConversationCommand, token?: string): Promise<AssistantConversationReadModel> {
    const conversationId = createAssistantConversationId(command.conversationId).value;
    const conversation = await this.gateway.archiveConversation(conversationId, token);
    return toConversationReadModel(conversation);
  }
}
