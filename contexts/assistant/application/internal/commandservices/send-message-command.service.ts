import { createAssistantConversationId } from "../../../domain/model/value-objects/assistant-conversation-id";
import { createAssistantMessageContent } from "../../../domain/model/value-objects/assistant-message-content";
import type { SendMessageCommand } from "../../../domain/model/commands/send-message.command";
import type { AssistantConversationsPort } from "../../ports/assistant-port";
import type { AssistantConversationReadModel } from "../transforms/assistant.read-models";
import { toConversationReadModel } from "../transforms/assistant-conversation.transform";

export class SendMessageCommandService {
  constructor(private readonly repository: AssistantConversationsPort) {}

  async handle(command: SendMessageCommand, token?: string): Promise<AssistantConversationReadModel> {
    const conversationId = createAssistantConversationId(command.conversationId).value;
    const message = createAssistantMessageContent(command.message).value;
    const conversation = await this.repository.sendMessage(
      conversationId,
      { messageContent: message, establishmentId: command.establishmentId },
      token,
    );
    return toConversationReadModel(conversation);
  }
}

export function createSendMessageCommandService(
  repository: AssistantConversationsPort,
): SendMessageCommandService {
  return new SendMessageCommandService(repository);
}
