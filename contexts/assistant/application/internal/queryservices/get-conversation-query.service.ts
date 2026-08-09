import "server-only";

import { createAssistantConversationsOutboundService } from "../outboundservices/assistant-conversations-outbound.service";
import { toConversationReadModel } from "../transforms/assistant-conversation.transform";
import type { AssistantConversationReadModel } from "../transforms/assistant.read-models";

export class GetConversationQueryService {
  constructor(private readonly conversations = createAssistantConversationsOutboundService()) {}

  async handle(conversationId: string, token?: string): Promise<AssistantConversationReadModel> {
    const conversation = await this.conversations.getConversation(conversationId, token);
    return toConversationReadModel(conversation);
  }
}
