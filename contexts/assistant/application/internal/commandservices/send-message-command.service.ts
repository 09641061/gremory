import "server-only";

import { createAssistantConversationId } from "../../../domain/model/value-objects/assistant-conversation-id";
import { createAssistantMessageContent } from "../../../domain/model/value-objects/assistant-message-content";
import type { SendMessageCommand } from "../../../domain/model/commands/send-message.command";
import { AssistantConversationRepositoryImpl } from "@/contexts/assistant/infrastructure/repositories/assistant-conversation.repository";
import type { AssistantConversationReadModel } from "../transforms/assistant.read-models";
import { toConversationReadModelFromEntity } from "../transforms/assistant-conversation.transform";

export class SendMessageCommandService {
  constructor(private readonly repository = new AssistantConversationRepositoryImpl()) {}

  async handle(command: SendMessageCommand, token?: string): Promise<AssistantConversationReadModel> {
    const conversationId = createAssistantConversationId(command.conversationId).value;
    const message = createAssistantMessageContent(command.message).value;
    const conversation = await this.repository.sendMessage({ conversationId, message }, token);
    return toConversationReadModelFromEntity(conversation);
  }
}
