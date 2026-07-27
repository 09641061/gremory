import "server-only";

import type { AssistantConversationReadModel } from "../../model/assistant.read-models";
import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

import { toConversationReadModel } from "../transforms/assistant-conversation.transform";

export class GetConversationQueryService {
  constructor(private readonly gateway = new AssistantApiGateway()) {}

  async handle(conversationId: string, token?: string): Promise<AssistantConversationReadModel> {
    const conversation = await this.gateway.getConversation(conversationId, token);
    return toConversationReadModel(conversation);
  }
}
