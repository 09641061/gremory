export type AssistantChatMessageRole = "user" | "assistant";

export interface AssistantConversationSummary {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string | null;
  messageCount: number;
}

export interface AssistantChatMessage {
  id: string;
  role: AssistantChatMessageRole;
  content: string;
  intent?: string | null;
  createdAt: string;
}

export interface AssistantConversation extends AssistantConversationSummary {
  messages: AssistantChatMessage[];
}

export interface AssistantConversationPage {
  content: AssistantConversationSummary[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
