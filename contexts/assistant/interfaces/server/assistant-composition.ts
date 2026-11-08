import "server-only";

import { AssistantApiGateway } from "../../infrastructure/gateways/assistant-api.gateway";
import { ListConversationsQueryService } from "../../application/internal/queryservices/list-conversations-query.service";
import { GetConversationQueryService } from "../../application/internal/queryservices/get-conversation-query.service";
import { SendMessageCommandService } from "../../application/internal/commandservices/send-message-command.service";
import { SubmitAssistantMessageCommandService } from "../../application/internal/commandservices/submit-assistant-message-command.service";
import { CreateConversationCommandService } from "../../application/internal/commandservices/create-conversation-command.service";
import { DeleteConversationCommandService } from "../../application/internal/commandservices/delete-conversation-command.service";
import { RenameConversationCommandService } from "../../application/internal/commandservices/rename-conversation-command.service";
import type { AssistantConversationsPort } from "../../application/ports/assistant-port";

/**
 * Server-only composition for the Assistant bounded context.
 *
 * Composition returns a fresh set of adapters per invocation. Callers MUST NOT
 * import the gateway directly. The gateway implements the Application port and
 * is injected into every command/query service.
 */
export type ComposedAssistantAdapters = Readonly<{
  gateway: AssistantApiGateway;
  conversations: AssistantConversationsPort;
  listConversations: ListConversationsQueryService;
  getConversation: GetConversationQueryService;
  sendMessage: SendMessageCommandService;
  submitAssistantMessage: SubmitAssistantMessageCommandService;
  createConversation: CreateConversationCommandService;
  deleteConversation: DeleteConversationCommandService;
  renameConversation: RenameConversationCommandService;
}>;

export function composeAssistantAdapters(organizationId?: string): ComposedAssistantAdapters {
  const gateway = new AssistantApiGateway(organizationId);
  const conversations: AssistantConversationsPort = gateway;
  const createConversation = new CreateConversationCommandService(conversations);
  const sendMessage = new SendMessageCommandService(conversations);
  return {
    gateway,
    conversations,
    listConversations: new ListConversationsQueryService(conversations),
    getConversation: new GetConversationQueryService(conversations),
    sendMessage,
    createConversation,
    submitAssistantMessage: new SubmitAssistantMessageCommandService(
      createConversation,
      sendMessage,
    ),
    deleteConversation: new DeleteConversationCommandService(conversations),
    renameConversation: new RenameConversationCommandService(conversations),
  };
}
