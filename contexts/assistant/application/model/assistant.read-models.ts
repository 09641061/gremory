export type AssistantConversationSummaryReadModel = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string | null;
  messageCount: number;
};

export type AssistantMessageReadModel = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string | null;
  createdAt: string;
};

export type AssistantConversationReadModel = AssistantConversationSummaryReadModel & {
  messages: AssistantMessageReadModel[];
};

export type AssistantConversationPageReadModel = {
  content: AssistantConversationSummaryReadModel[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};
