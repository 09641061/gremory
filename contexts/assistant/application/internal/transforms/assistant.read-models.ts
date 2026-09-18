export type AssistantConversationSummaryReadModel = {
  id: string;
  title: string | null;
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
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};
