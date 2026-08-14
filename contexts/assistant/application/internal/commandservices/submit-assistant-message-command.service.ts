import "server-only";

import { CreateConversationCommandService } from "./create-conversation-command.service";
import { SendMessageCommandService } from "./send-message-command.service";
import type { AssistantConversationReadModel } from "../transforms/assistant.read-models";

export interface SubmitAssistantMessageCommand {
  conversationId?: string | null;
  message: string;
  establishmentId?: string | null;
}

export class SubmitAssistantMessageCommandService {
  constructor(
    private readonly createConversationService = new CreateConversationCommandService(),
    private readonly sendMessageService = new SendMessageCommandService(),
  ) {}

  async handle(
    command: SubmitAssistantMessageCommand,
    token?: string,
  ): Promise<AssistantConversationReadModel> {
    if (command.conversationId) {
      return this.sendMessageService.handle(
        {
          conversationId: command.conversationId,
          message: command.message,
          establishmentId: command.establishmentId,
        },
        token,
      );
    }

    return this.createConversationService.handle(
      {
        messageContent: command.message,
        establishmentId: command.establishmentId,
      },
      token,
    );
  }
}
