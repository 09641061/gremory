import "server-only";

import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

import { toConversationPageReadModel } from "../transforms/assistant-conversation.transform";
import type { AssistantConversationPageReadModel } from "../transforms/assistant.read-models";

export interface ListConversationsQuery {
  search?: string;
  page?: number;
  size?: number;
}

export class ListConversationsQueryService {
  constructor(private readonly gateway = new AssistantApiGateway()) {}

  async handle(query: ListConversationsQuery, token?: string): Promise<AssistantConversationPageReadModel> {
    const page = await this.gateway.listConversations(query, token);
    return toConversationPageReadModel(page);
  }
}
