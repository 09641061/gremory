import "server-only";

import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

import { toConversationReadModel } from "../transforms/assistant-conversation.transform";
import type { AssistantConversationReadModel } from "../transforms/assistant.read-models";

export class GetConversationQueryService {
  constructor(private readonly gateway = new AssistantApiGateway()) {}

  async handle(conversationId: string, token?: string): Promise<AssistantConversationReadModel> {
    const conversation = await this.gateway.getConversation(conversationId, token);
    return toConversationReadModel(conversation);
  }
}
