import "server-only";

import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

import { createAssistantConversationId } from "../../../domain/model/value-objects/assistant-conversation-id";
import { createAssistantConversationTitle } from "../../../domain/model/value-objects/assistant-conversation-title";
import type { RenameConversationCommand } from "../../../domain/model/commands/rename-conversation.command";
import { toConversationReadModel } from "../transforms/assistant-conversation.transform";
import type { AssistantConversationReadModel } from "../transforms/assistant.read-models";

export class RenameConversationCommandService {
  constructor(private readonly gateway = new AssistantApiGateway()) {}

  async handle(command: RenameConversationCommand, token?: string): Promise<AssistantConversationReadModel> {
    const conversationId = createAssistantConversationId(command.conversationId).value;
    const title = createAssistantConversationTitle(command.title).value;
    const conversation = await this.gateway.renameConversation(
      conversationId,
      { title },
      token,
    );
    return toConversationReadModel(conversation);
  }
}
