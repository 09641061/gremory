import type { CreateConversationCommand } from "../../../domain/model/commands/create-conversation.command";
import type { AssistantConversationsPort } from "../../ports/assistant-port";
import type { AssistantConversationReadModel } from "../transforms/assistant.read-models";
import { toConversationReadModelFromEntity } from "../transforms/assistant-conversation.transform";

export class CreateConversationCommandService {
  constructor(private readonly repository: AssistantConversationsPort) {}

  async handle(command: CreateConversationCommand, token?: string): Promise<AssistantConversationReadModel> {
    const conversation = await this.repository.createConversation(
      { messageContent: command.messageContent, establishmentId: command.establishmentId },
      token,
    );
    return toConversationReadModelFromEntity(conversation);
  }
}

export function createCreateConversationCommandService(
  repository: AssistantConversationsPort,
): CreateConversationCommandService {
  return new CreateConversationCommandService(repository);
}
