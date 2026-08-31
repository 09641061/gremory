import "server-only";

import { createAssistantConversationId } from "../../../domain/model/value-objects/assistant-conversation-id";
import type { DeleteConversationCommand } from "../../../domain/model/commands/delete-conversation.command";
import { AssistantConversationRepositoryImpl } from "@/contexts/assistant/infrastructure/repositories/assistant-conversation.repository";

export class DeleteConversationCommandService {
  constructor(private readonly repository: AssistantConversationRepositoryImpl = new AssistantConversationRepositoryImpl()) {}

  async handle(command: DeleteConversationCommand, token?: string): Promise<void> {
    const conversationId = createAssistantConversationId(command.conversationId).value;
    await this.repository.deleteConversation({ conversationId }, token);
  }
}
