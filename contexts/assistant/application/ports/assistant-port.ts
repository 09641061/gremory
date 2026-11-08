import type {
  AssistantConversationResponse,
  AssistantConversationSummaryPage,
  CreateConversationRequest,
  ListConversationsParams,
  RenameConversationRequest,
  SendAssistantMessageRequest,
} from "../model/assistant.view-models";
import type { AssistantConversation } from "../../domain/model/entities/assistant-conversation";

/**
 * Server-only port for the assistant conversation backend. Implementation
 * lives in Infrastructure and is injected via composition.
 */
export interface AssistantConversationsPort {
  listConversations(
    params: ListConversationsParams,
    token: string | undefined,
  ): Promise<AssistantConversationSummaryPage>;
  getConversation(
    conversationId: string,
    token: string | undefined,
  ): Promise<AssistantConversationResponse>;
  createConversation(
    request: CreateConversationRequest,
    token: string | undefined,
  ): Promise<AssistantConversation>;
  renameConversation(
    conversationId: string,
    request: RenameConversationRequest,
    token: string | undefined,
  ): Promise<AssistantConversationResponse>;
  deleteConversation(
    conversationId: string,
    token: string | undefined,
  ): Promise<void>;
  sendMessage(
    conversationId: string,
    request: SendAssistantMessageRequest,
    token: string | undefined,
  ): Promise<AssistantConversationResponse>;
  submitAssistantMessage(
    conversationId: string,
    request: SendAssistantMessageRequest,
    token: string | undefined,
  ): Promise<AssistantConversationResponse>;
}
