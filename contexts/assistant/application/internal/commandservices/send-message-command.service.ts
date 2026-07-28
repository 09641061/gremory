import "server-only";

import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

import { createAssistantConversationId } from "../../../domain/model/value-objects/assistant-conversation-id";
import { createAssistantMessageContent } from "../../../domain/model/value-objects/assistant-message-content";
import type { SendMessageCommand } from "../../../domain/model/commands/send-message.command";
import type { AssistantConversationReadModel } from "../../model/assistant.read-models";
import { toConversationReadModel } from "../transforms/assistant-conversation.transform";

export class SendMessageCommandService {
  constructor(private readonly gateway = new AssistantApiGateway()) {}

  async handle(command: SendMessageCommand, token?: string): Promise<AssistantConversationReadModel> {
    const conversationId = createAssistantConversationId(command.conversationId).value;
    const message = createAssistantMessageContent(command.message).value;
    const conversation = await this.gateway.sendMessage(conversationId, { messageContent: message }, token);
    return toConversationReadModel(conversation);
  }
}
