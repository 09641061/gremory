export type AssistantConversationSummaryReadModel = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type AssistantMessageReadModel = {
  id: string;
  role: "user" | "assistant";
  content: string;
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
