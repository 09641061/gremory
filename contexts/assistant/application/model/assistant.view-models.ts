/**
 * Application-owned Assistant view models. Mirrors the runtime contract
 * validated by the Infrastructure gateway.
 */
import type { PageResponse } from "@/contexts/shared/domain/model/page-response";

export type AssistantMessageRole = "USER" | "AGENT" | string;

export type AssistantConversationSummaryResponse = Readonly<{
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export type AssistantMessageResponse = Readonly<{
  id: string;
  sender: string;
  role: AssistantMessageRole;
  content: string;
  createdAt: string;
}>;

export type AssistantConversationResponse = AssistantConversationSummaryResponse & {
  messages: ReadonlyArray<AssistantMessageResponse>;
};

export type AssistantConversationSummaryPage = PageResponse<AssistantConversationSummaryResponse>;

export type CreateConversationRequest = Readonly<{
  messageContent: string;
  establishmentId?: string | null;
}>;

export type RenameConversationRequest = Readonly<{
  title: string;
}>;

export type SendAssistantMessageRequest = Readonly<{
  messageContent: string;
  establishmentId?: string | null;
}>;

export type ListConversationsParams = Readonly<{
  search?: string;
  page?: number;
  size?: number;
}>;
