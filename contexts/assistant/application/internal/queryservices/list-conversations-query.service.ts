import "server-only";

import { createAssistantConversationsAdapter } from "@/contexts/assistant/infrastructure/adapters/assistant-conversations.adapter";
import { toConversationPageReadModel } from "../transforms/assistant-conversation.transform";
import type { AssistantConversationPageReadModel } from "../transforms/assistant.read-models";

export interface ListConversationsQuery {
  search?: string;
  page?: number;
  size?: number;
}

export class ListConversationsQueryService {
  constructor(private readonly conversations = createAssistantConversationsAdapter()) {}

  async handle(query: ListConversationsQuery, token?: string): Promise<AssistantConversationPageReadModel> {
    const page = await this.conversations.listConversations(query, token);
    return toConversationPageReadModel(page);
  }
}
