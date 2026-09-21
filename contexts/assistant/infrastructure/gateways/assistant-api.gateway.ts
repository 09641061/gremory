import "server-only";

import { cookies } from "next/headers";

import { apiConfig } from "@/api.config";
import {
  apiClient,
} from "@/contexts/shared/infrastructure/http/api-client";
import type { PageResponse } from "@/contexts/shared/application/model/page-response";
export type { PageResponse } from "@/contexts/shared/application/model/page-response";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import {
  assistantConversationPageResponseSchema,
  assistantConversationResponseSchema,
} from "../../interfaces/rest/schemas/assistant-chat.schemas";

export type AssistantMessageRole = "USER" | "AGENT" | string;

export interface AssistantConversationSummaryResponse {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssistantMessageResponse {
  id: string;
  sender: string;
  role: AssistantMessageRole;
  content: string;
  createdAt: string;
}

export interface AssistantConversationResponse
  extends AssistantConversationSummaryResponse {
  messages: AssistantMessageResponse[];
}

export interface CreateConversationRequest {
  messageContent: string;
  establishmentId?: string | null;
}

export interface RenameConversationRequest {
  title: string;
}

export interface SendAssistantMessageRequest {
  messageContent: string;
  establishmentId?: string | null;
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
  constructor(private readonly organizationId?: string) {}

  async listConversations(
    params: ListConversationsParams = {},
    token?: string,
  ): Promise<PageResponse<AssistantConversationSummaryResponse>> {
    const authToken = await resolveAccessToken(token);
    const query = new URLSearchParams();

    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));

    const response = await apiClient.get<unknown>(
      `${apiConfig.routes.assistantConversations}?${query.toString()}`,
      {
        token: authToken,
        tenantId: this.organizationId,
        errorMessage: "Failed to fetch assistant conversations",
      },
    );
    return assistantConversationPageResponseSchema.parse(response);
  }

  async getConversation(
    id: string,
    token?: string,
  ): Promise<AssistantConversationResponse> {
    const authToken = await resolveAccessToken(token);

    const response = await apiClient.get<unknown>(
      `${apiConfig.routes.assistantConversations}/${encodeURIComponent(id)}`,
      {
        token: authToken,
        tenantId: this.organizationId,
        errorMessage: "Failed to fetch assistant conversation",
      },
    );
    return assistantConversationResponseSchema.parse(response);
  }

  async createConversation(
    command: CreateConversationRequest,
    token?: string,
  ): Promise<AssistantConversationResponse> {
    const authToken = await resolveAccessToken(token);

    const response = await apiClient.post<unknown>(
      apiConfig.routes.assistantConversations,
      command,
      {
        token: authToken,
        tenantId: this.organizationId,
        errorMessage: "Failed to create assistant conversation",
      },
    );
    return assistantConversationResponseSchema.parse(response);
  }

  async sendMessage(
    id: string,
    command: SendAssistantMessageRequest,
    token?: string,
  ): Promise<AssistantConversationResponse> {
    const authToken = await resolveAccessToken(token);

    const response = await apiClient.post<unknown>(
      `${apiConfig.routes.assistantConversations}/${encodeURIComponent(id)}/messages`,
      command,
      {
        token: authToken,
        tenantId: this.organizationId,
        errorMessage: "Failed to send assistant message",
      },
    );
    return assistantConversationResponseSchema.parse(response);
  }

  async sendMessageStream(
    id: string,
    command: SendAssistantMessageRequest,
    token?: string,
    options: { signal?: AbortSignal; timeoutMs?: number; correlationId?: string } = {},
  ): Promise<Response> {
    const authToken = await resolveAccessToken(token);

    return apiClient.requestStream(
      `${apiConfig.routes.assistantConversations}/${encodeURIComponent(id)}/messages/stream`,
      {
        method: "POST",
        token: authToken,
        tenantId: this.organizationId,
        signal: options.signal,
        timeoutMs: options.timeoutMs,
        correlationId: options.correlationId,
        headers: { Accept: "text/event-stream" },
        body: command,
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
        tenantId: this.organizationId,
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
        tenantId: this.organizationId,
        errorMessage: "Failed to delete assistant conversation",
      },
    );
  }
}
