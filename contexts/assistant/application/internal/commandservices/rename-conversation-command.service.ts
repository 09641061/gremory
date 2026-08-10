import "server-only";

import { createAssistantConversationId } from "../../../domain/model/value-objects/assistant-conversation-id";
import { createAssistantConversationTitle } from "../../../domain/model/value-objects/assistant-conversation-title";
import type { RenameConversationCommand } from "../../../domain/model/commands/rename-conversation.command";
import { AssistantConversationRepositoryImpl } from "@/contexts/assistant/infrastructure/repositories/assistant-conversation.repository";
import type { AssistantConversationReadModel } from "../transforms/assistant.read-models";
import { toConversationReadModelFromEntity } from "../transforms/assistant-conversation.transform";

export class RenameConversationCommandService {
  constructor(private readonly repository: AssistantConversationRepositoryImpl = new AssistantConversationRepositoryImpl()) {}

  async handle(command: RenameConversationCommand, token?: string): Promise<AssistantConversationReadModel> {
    const conversationId = createAssistantConversationId(command.conversationId).value;
    const title = createAssistantConversationTitle(command.title).value;
    const conversation = await this.repository.renameConversation({ conversationId, title }, token);
    return toConversationReadModelFromEntity(conversation);
  }
}
