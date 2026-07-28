import type {
  AssistantConversationResponse,
  AssistantConversationSummaryResponse,
  AssistantMessageResponse,
} from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

import { createAssistantConversationId } from "../../../domain/model/value-objects/assistant-conversation-id";
import { createAssistantConversationTitle } from "../../../domain/model/value-objects/assistant-conversation-title";
import { createAssistantMessageContent } from "../../../domain/model/value-objects/assistant-message-content";
import type {
  AssistantConversationPageReadModel,
  AssistantConversationReadModel,
  AssistantConversationSummaryReadModel,
  AssistantMessageReadModel,
} from "../../model/assistant.read-models";
import type { PageResponse } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";

function normalizeMessage(message: AssistantMessageResponse): AssistantMessageReadModel {
  return {
    id: message.id,
    role: message.role.toUpperCase() === "ASSISTANT" ? "assistant" : "user",
    content: createAssistantMessageContent(message.content).value,
    intent: message.intent ?? null,
    createdAt: message.createdAt,
  };
}

function normalizeSummary(
  conversation: AssistantConversationSummaryResponse,
): AssistantConversationSummaryReadModel {
  return {
    id: createAssistantConversationId(conversation.id).value,
    title: createAssistantConversationTitle(conversation.title).value,
    status: conversation.status,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    lastMessageAt: conversation.lastMessageAt ?? null,
    messageCount: conversation.messageCount,
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
