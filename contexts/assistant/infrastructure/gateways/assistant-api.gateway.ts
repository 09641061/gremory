import "server-only";

import { cookies } from "next/headers";

import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export type AssistantMessageRole = "USER" | "AGENT" | string;

export interface AssistantConversationSummaryResponse {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssistantMessageResponse {
  id: string;
  role: AssistantMessageRole;
  content: string;
  createdAt: string;
}

export interface AssistantConversationResponse
  extends AssistantConversationSummaryResponse {
  messages: AssistantMessageResponse[];
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CreateConversationRequest {
  messageContent: string;
}

export interface RenameConversationRequest {
  title: string;
}

export interface SendAssistantMessageRequest {
  messageContent: string;
}

export interface ListConversationsParams {
  search?: string;
  page?: number;
  size?: number;
}

async function resolveAccessToken(providedToken?: string): Promise<string | undefined> {
  if (providedToken) return providedToken;

  try {
    const cookieStore = await cookies();
    return cookieStore.get(iamSessionCookies.accessToken)?.value;
  } catch {
    return undefined;
  }
}

export class AssistantApiGateway {
  async listConversations(
    params: ListConversationsParams = {},
    token?: string,
  ): Promise<PageResponse<AssistantConversationSummaryResponse>> {
    const authToken = await resolveAccessToken(token);
    const query = new URLSearchParams();

    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));

    return apiClient.get<PageResponse<AssistantConversationSummaryResponse>>(
      `${apiConfig.routes.assistantConversations}?${query.toString()}`,
      {
        token: authToken,
        errorMessage: "Failed to fetch assistant conversations",
      },
    );
  }

  async getConversation(
    id: string,
    token?: string,
  ): Promise<AssistantConversationResponse> {
    const authToken = await resolveAccessToken(token);

    return apiClient.get<AssistantConversationResponse>(
      `${apiConfig.routes.assistantConversations}/${encodeURIComponent(id)}`,
      {
        token: authToken,
        errorMessage: "Failed to fetch assistant conversation",
      },
    );
  }

  async createConversation(
    command: CreateConversationRequest,
    token?: string,
  ): Promise<AssistantConversationResponse> {
    const authToken = await resolveAccessToken(token);

    return apiClient.post<AssistantConversationResponse>(
      apiConfig.routes.assistantConversations,
      command,
      {
        token: authToken,
        errorMessage: "Failed to create assistant conversation",
      },
    );
  }

  async sendMessage(
    id: string,
    command: SendAssistantMessageRequest,
    token?: string,
  ): Promise<AssistantConversationResponse> {
    const authToken = await resolveAccessToken(token);

    return apiClient.post<AssistantConversationResponse>(
      `${apiConfig.routes.assistantConversations}/${encodeURIComponent(id)}/messages`,
      command,
      {
        token: authToken,
        errorMessage: "Failed to send assistant message",
      },
    );
  }

  async renameConversation(
    id: string,
    command: RenameConversationRequest,
    token?: string,
  ): Promise<AssistantConversationResponse> {
    const authToken = await resolveAccessToken(token);

    return apiClient.patch<AssistantConversationResponse>(
      `${apiConfig.routes.assistantConversations}/${encodeURIComponent(id)}/title`,
      command,
      {
        token: authToken,
        errorMessage: "Failed to rename assistant conversation",
      },
    );
  }

  async deleteConversation(id: string, token?: string): Promise<void> {
    const authToken = await resolveAccessToken(token);

    await apiClient.delete<void>(
      `${apiConfig.routes.assistantConversations}/${encodeURIComponent(id)}`,
      {
        token: authToken,
        errorMessage: "Failed to delete assistant conversation",
      },
    );
  }
}
