import type {
  AssistantConversationResponse,
  AssistantConversationSummaryResponse,
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

import { normalizeAssistantRole } from "../../../domain/model/value-objects/assistant-message-role";

type ConversationMessageSource = {
  id: string;
  role?: string | null;
  content: string;
  createdAt: string;
};

const DEFAULT_ASSISTANT_GREETING = "Hello. I am your assistant for business, customers, catalog, and scheduling.";

function normalizeMessage(message: ConversationMessageSource): AssistantMessageReadModel {
  const role = normalizeAssistantRole(message.role);
  const content = createAssistantMessageContent(message.content).value;

  return {
    id: message.id,
    role,
    content,
    createdAt: message.createdAt,
  };
}

function stripDefaultGreeting(messages: AssistantMessageReadModel[]): AssistantMessageReadModel[] {
  const [firstMessage, ...restMessages] = messages;

  if (
    firstMessage?.role === "assistant" &&
    firstMessage.content === DEFAULT_ASSISTANT_GREETING
  ) {
    return restMessages;
  }

  return messages;
}

function normalizeConversationMessages(
  messages: ConversationMessageSource[],
): AssistantMessageReadModel[] {
  const normalizedMessages = stripDefaultGreeting(messages.map(normalizeMessage));
  const hasAssistantMessage = normalizedMessages.some((message) => message.role === "assistant");

  if (hasAssistantMessage || normalizedMessages.length <= 1) {
    return normalizedMessages;
  }

  // Some legacy conversations come back with flattened roles.
  // When that happens, recover the expected left/right alternation by order.
  return normalizedMessages.map((message, index) => ({
    ...message,
    role: index % 2 === 0 ? "user" : "assistant",
  }));
}

function normalizeSummary(
  conversation: AssistantConversationSummaryResponse,
): AssistantConversationSummaryReadModel {
  return {
    id: createAssistantConversationId(conversation.id).value,
    title: conversation.title?.trim()
      ? createAssistantConversationTitle(conversation.title).value
      : null,
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
    messages: normalizeConversationMessages(conversation.messages),
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
    messages: normalizeConversationMessages(
      conversation.getMessages().map((message: AssistantMessage) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      })),
    ),
  };
}
