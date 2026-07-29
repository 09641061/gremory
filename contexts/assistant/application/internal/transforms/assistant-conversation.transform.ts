import type {
  AssistantConversationResponse,
  AssistantConversationSummaryResponse,
  AssistantMessageResponse,
  PageResponse,
} from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

import type { AssistantConversation } from "../../../domain/model/entities/assistant-conversation";
import type { AssistantMessage } from "../../../domain/model/entities/assistant-message";
import { createAssistantConversationId } from "../../../domain/model/value-objects/assistant-conversation-id";
import { createAssistantConversationTitle } from "../../../domain/model/value-objects/assistant-conversation-title";
import { createAssistantMessageContent } from "../../../domain/model/value-objects/assistant-message-content";
import type {
  AssistantConversationPageReadModel,
  AssistantConversationReadModel,
  AssistantConversationSummaryReadModel,
  AssistantMessageReadModel,
} from "./assistant.read-models";

function normalizeMessage(message: AssistantMessageResponse): AssistantMessageReadModel {
  const role = (message.role ?? "").toUpperCase();

  return {
    id: message.id,
    role: role === "ASSISTANT" || role === "AGENT" ? "assistant" : "user",
    content: createAssistantMessageContent(message.content).value,
    createdAt: message.createdAt,
  };
}

function normalizeSummary(
  conversation: AssistantConversationSummaryResponse,
): AssistantConversationSummaryReadModel {
  return {
    id: createAssistantConversationId(conversation.id).value,
    title: conversation.title ? createAssistantConversationTitle(conversation.title).value : "Nueva conversacion",
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

export function toConversationPageReadModel(
  page: PageResponse<AssistantConversationSummaryResponse>,
): AssistantConversationPageReadModel {
  return {
    content: page.content.map(normalizeSummary),
    pageable: {
      pageNumber: page.pageable.pageNumber,
      pageSize: page.pageable.pageSize,
    },
    totalElements: page.totalElements,
    totalPages: page.totalPages,
    first: page.first,
    last: page.last,
  };
}

export function toConversationReadModel(
  conversation: AssistantConversationResponse,
): AssistantConversationReadModel {
  const summary = normalizeSummary(conversation);

  return {
    ...summary,
    messages: conversation.messages.map(normalizeMessage),
  };
}

export function toConversationReadModelFromEntity(
  conversation: AssistantConversation,
): AssistantConversationReadModel {
  return {
    id: conversation.id.value,
    title: conversation.getTitle(),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messages: conversation.getMessages().map((message: AssistantMessage) => ({
      id: message.id,
      role: message.role === "ASSISTANT" ? "assistant" : "user",
      content: message.content,
      createdAt: message.createdAt,
    })),
  };
}
