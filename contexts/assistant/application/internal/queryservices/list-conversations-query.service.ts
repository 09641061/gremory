import "server-only";

import type { AssistantConversationPageReadModel } from "../../model/assistant.read-models";
import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

import { toConversationPageReadModel } from "../transforms/assistant-conversation.transform";

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
