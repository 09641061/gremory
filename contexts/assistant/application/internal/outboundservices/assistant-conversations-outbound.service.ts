import "server-only";

import { AssistantApiGateway, type AssistantConversationResponse, type AssistantConversationSummaryResponse, type ListConversationsParams, type PageResponse } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

export class AssistantConversationsOutboundService {
  constructor(private readonly gateway = new AssistantApiGateway()) {}

  listConversations(
    query: ListConversationsParams,
    token?: string,
  ): Promise<PageResponse<AssistantConversationSummaryResponse>> {
    return this.gateway.listConversations(query, token);
  }

  getConversation(id: string, token?: string): Promise<AssistantConversationResponse> {
    return this.gateway.getConversation(id, token);
  }
}

export function createAssistantConversationsOutboundService() {
  return new AssistantConversationsOutboundService();
}
