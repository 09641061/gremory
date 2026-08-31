import "server-only";

import { createAssistantConversationsAdapter } from "@/contexts/assistant/infrastructure/adapters/assistant-conversations.adapter";
import { toConversationReadModel } from "../transforms/assistant-conversation.transform";
import type { AssistantConversationReadModel } from "../transforms/assistant.read-models";

export class GetConversationQueryService {
  constructor(private readonly conversations = createAssistantConversationsAdapter()) {}

  async handle(conversationId: string, token?: string): Promise<AssistantConversationReadModel> {
    const conversation = await this.conversations.getConversation(conversationId, token);
    return toConversationReadModel(conversation);
  }
}
