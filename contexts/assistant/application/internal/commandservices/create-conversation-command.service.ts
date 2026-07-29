import "server-only";

import type { CreateConversationCommand } from "../../../domain/model/commands/create-conversation.command";
import { AssistantConversationRepositoryImpl } from "@/contexts/assistant/infrastructure/repositories/assistant-conversation.repository";
import type { AssistantConversationReadModel } from "../transforms/assistant.read-models";
import { toConversationReadModelFromEntity } from "../transforms/assistant-conversation.transform";

export class CreateConversationCommandService {
  constructor(private readonly repository = new AssistantConversationRepositoryImpl()) {}

  async handle(command: CreateConversationCommand, token?: string): Promise<AssistantConversationReadModel> {
    const conversation = await this.repository.createConversation(
      { messageContent: command.messageContent },
      token,
    );
    return toConversationReadModelFromEntity(conversation);
  }
}
