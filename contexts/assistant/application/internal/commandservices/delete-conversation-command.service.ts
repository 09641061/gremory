import { createAssistantConversationId } from "../../../domain/model/value-objects/assistant-conversation-id";
import type { DeleteConversationCommand } from "../../../domain/model/commands/delete-conversation.command";
import type { AssistantConversationsPort } from "../../ports/assistant-port";

export class DeleteConversationCommandService {
  constructor(private readonly repository: AssistantConversationsPort) {}

  async handle(command: DeleteConversationCommand, token?: string): Promise<void> {
    const conversationId = createAssistantConversationId(command.conversationId).value;
    await this.repository.deleteConversation(conversationId, token);
  }
}

export function createDeleteConversationCommandService(
  repository: AssistantConversationsPort,
): DeleteConversationCommandService {
  return new DeleteConversationCommandService(repository);
}
