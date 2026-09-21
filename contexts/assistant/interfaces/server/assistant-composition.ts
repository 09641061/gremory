import "server-only";

import { AssistantApiGateway } from "../../infrastructure/gateways/assistant-api.gateway";
import { ListConversationsQueryService } from "../../application/internal/queryservices/list-conversations-query.service";
import { GetConversationQueryService } from "../../application/internal/queryservices/get-conversation-query.service";
import { SendMessageCommandService } from "../../application/internal/commandservices/send-message-command.service";
import { SubmitAssistantMessageCommandService } from "../../application/internal/commandservices/submit-assistant-message-command.service";
import { CreateConversationCommandService } from "../../application/internal/commandservices/create-conversation-command.service";
import { DeleteConversationCommandService } from "../../application/internal/commandservices/delete-conversation-command.service";
import { RenameConversationCommandService } from "../../application/internal/commandservices/rename-conversation-command.service";

/**
 * Server-only composition for the Assistant bounded context.
 *
 * Composition returns a fresh set of adapters per invocation. Callers MUST NOT
 * import the gateway directly. Future migration target: replace this with
 * `application/ports/{assistant-reader, assistant-writer,
 * assistant-streaming-writer}.ts` once the gateway implements those
 * consumer-owned contracts.
 */
export type ComposedAssistantAdapters = Readonly<{
  gateway: AssistantApiGateway;
  listConversations: ListConversationsQueryService;
  getConversation: GetConversationQueryService;
  sendMessage: SendMessageCommandService;
  submitAssistantMessage: SubmitAssistantMessageCommandService;
  createConversation: CreateConversationCommandService;
  deleteConversation: DeleteConversationCommandService;
  renameConversation: RenameConversationCommandService;
}>;

export function composeAssistantAdapters(): ComposedAssistantAdapters {
  const gateway = new AssistantApiGateway();
  return {
    gateway,
    listConversations: new ListConversationsQueryService(),
    getConversation: new GetConversationQueryService(),
    sendMessage: new SendMessageCommandService(),
    submitAssistantMessage: new SubmitAssistantMessageCommandService(),
    createConversation: new CreateConversationCommandService(),
    deleteConversation: new DeleteConversationCommandService(),
    renameConversation: new RenameConversationCommandService(),
  };
}
