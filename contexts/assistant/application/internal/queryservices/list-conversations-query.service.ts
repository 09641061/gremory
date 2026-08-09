import "server-only";

import { createAssistantConversationsOutboundService } from "../outboundservices/assistant-conversations-outbound.service";
import { toConversationPageReadModel } from "../transforms/assistant-conversation.transform";
import type { AssistantConversationPageReadModel } from "../transforms/assistant.read-models";

export interface ListConversationsQuery {
  search?: string;
  page?: number;
  size?: number;
}

export class ListConversationsQueryService {
  constructor(private readonly conversations = createAssistantConversationsOutboundService()) {}

  async handle(query: ListConversationsQuery, token?: string): Promise<AssistantConversationPageReadModel> {
    const page = await this.conversations.listConversations(query, token);
    return toConversationPageReadModel(page);
  }
}
