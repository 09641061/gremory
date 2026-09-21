import type { AssistantConversationsPort } from "../../ports/assistant-port";
import { toConversationReadModel } from "../transforms/assistant-conversation.transform";
import type { AssistantConversationReadModel } from "../transforms/assistant.read-models";

export class GetConversationQueryService {
  constructor(private readonly conversations: AssistantConversationsPort) {}

  async handle(conversationId: string, token?: string): Promise<AssistantConversationReadModel> {
    const conversation = await this.conversations.getConversation(conversationId, token);
    return toConversationReadModel(conversation);
  }
}

export function createGetConversationQueryService(
  conversations: AssistantConversationsPort,
): GetConversationQueryService {
  return new GetConversationQueryService(conversations);
}
