import "server-only";

import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

import { createAssistantConversationTitle } from "../../../domain/model/value-objects/assistant-conversation-title";
import type { CreateConversationCommand } from "../../../domain/model/commands/create-conversation.command";
import { toConversationReadModel } from "../transforms/assistant-conversation.transform";
import type { AssistantConversationReadModel } from "../../model/assistant.read-models";

export class CreateConversationCommandService {
  constructor(private readonly gateway = new AssistantApiGateway()) {}

  async handle(command: CreateConversationCommand, token?: string): Promise<AssistantConversationReadModel> {
    const title = createAssistantConversationTitle(command.title).value;
    const conversation = await this.gateway.createConversation({ title }, token);
    return toConversationReadModel(conversation);
  }
}
