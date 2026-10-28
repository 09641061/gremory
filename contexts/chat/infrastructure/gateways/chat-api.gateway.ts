import "server-only";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import type { ChatWhatsappPort } from "../../application/ports/chat-whatsapp.port";
import type {
  WhatsappConversationSummary,
  WhatsappConversationDetail,
  WhatsappConversationPageViewModel,
  WhatsappMessageItem,
} from "../../application/models/whatsapp-chat";
import { apiClient, ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import {
  whatsappConversationPageResponseSchema,
  whatsappConversationDetailSchema,
  whatsappConversationSummarySchema,
  whatsappMessageItemSchema,
} from "../contracts/chat.schemas";

async function resolveAccessToken(providedToken?: string): Promise<string | undefined> {
  if (providedToken) return providedToken;
  try {
    const cookieStore = await cookies();
    return cookieStore.get(iamSessionCookies.accessToken)?.value;
  } catch {
    return undefined;
  }
}

export class ChatApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown, options?: ErrorOptions) {
    super(message, status, details, options);
    this.name = "ChatApiError";
  }
}

export class ChatApiGateway implements ChatWhatsappPort {
  constructor(private readonly organizationId?: string) {}

  private tenantOptions(): { tenantId?: string } {
    return { tenantId: this.organizationId };
  }

  async listConversations(
    establishmentId: string,
    filter = "ALL",
    search?: string,
    page = 0,
    size = 20,
    token?: string,
  ): Promise<WhatsappConversationPageViewModel> {
    const authToken = await resolveAccessToken(token);
    const query = new URLSearchParams({
      establishmentId,
      filter,
      page: String(page),
      size: String(size),
    });
    if (search) query.append("search", search);

    const response = await apiClient.get<unknown>(
      `/api/chat/whatsapp/conversations?${query.toString()}`,
      {
        token: authToken,
        ...this.tenantOptions(),
        errorMessage: "Failed to fetch WhatsApp conversations",
        errorType: ChatApiError,
      },
    );
    return parseProviderResponse(whatsappConversationPageResponseSchema, response, "whatsapp conversations page");
  }

  async getConversation(id: string, establishmentId: string, token?: string): Promise<WhatsappConversationDetail> {
    const authToken = await resolveAccessToken(token);
    const response = await apiClient.get<unknown>(
      `/api/chat/whatsapp/conversations/${encodeURIComponent(id)}?establishmentId=${encodeURIComponent(establishmentId)}`,
      {
        token: authToken,
        ...this.tenantOptions(),
        errorMessage: "Failed to fetch WhatsApp conversation",
        errorType: ChatApiError,
      },
    );
    return parseProviderResponse(whatsappConversationDetailSchema, response, "whatsapp conversation detail");
  }

  async takeoverConversation(id: string, establishmentId: string, token?: string): Promise<WhatsappConversationSummary> {
    const authToken = await resolveAccessToken(token);
    const response = await apiClient.post<unknown>(
      `/api/chat/whatsapp/conversations/${encodeURIComponent(id)}/takeover?establishmentId=${encodeURIComponent(establishmentId)}`,
      {},
      {
        token: authToken,
        ...this.tenantOptions(),
        errorMessage: "Failed to take over conversation",
        errorType: ChatApiError,
      },
    );
    return parseProviderResponse(whatsappConversationSummarySchema, response, "whatsapp conversation summary");
  }

  async releaseConversation(id: string, establishmentId: string, token?: string): Promise<WhatsappConversationSummary> {
    const authToken = await resolveAccessToken(token);
    const response = await apiClient.post<unknown>(
      `/api/chat/whatsapp/conversations/${encodeURIComponent(id)}/release?establishmentId=${encodeURIComponent(establishmentId)}`,
      {},
      {
        token: authToken,
        ...this.tenantOptions(),
        errorMessage: "Failed to release conversation",
        errorType: ChatApiError,
      },
    );
    return parseProviderResponse(whatsappConversationSummarySchema, response, "whatsapp conversation summary");
  }

  async sendMessage(id: string, establishmentId: string, text: string, token?: string): Promise<WhatsappMessageItem> {
    const authToken = await resolveAccessToken(token);
    const response = await apiClient.post<unknown>(
      `/api/chat/whatsapp/conversations/${encodeURIComponent(id)}/messages`,
      { establishmentId, content: text },
      {
        token: authToken,
        ...this.tenantOptions(),
        errorMessage: "Failed to send WhatsApp message",
        errorType: ChatApiError,
      },
    );
    return parseProviderResponse(whatsappMessageItemSchema, response, "whatsapp message item");
  }

  async openForCustomer(customerId: string, establishmentId: string, token?: string): Promise<WhatsappConversationSummary | null> {
    const authToken = await resolveAccessToken(token);
    const response = await apiClient.get<unknown>(
      `/api/chat/whatsapp/conversations/by-customer/${encodeURIComponent(customerId)}?establishmentId=${encodeURIComponent(establishmentId)}`,
      {
        token: authToken,
        ...this.tenantOptions(),
        errorMessage: "Failed to open WhatsApp conversation for customer",
        errorType: ChatApiError,
      },
    );
    if (!response) {
      return null;
    }
    return parseProviderResponse(whatsappConversationSummarySchema, response, "whatsapp conversation summary");
  }
}

function parseProviderResponse<T extends import("zod").ZodTypeAny>(
  schema: T,
  response: unknown,
  resource: string,
): import("zod").infer<T> {
  try {
    return schema.parse(response);
  } catch (cause) {
    throw new ChatApiError(`Invalid Chat ${resource} response`, 502, undefined, { cause });
  }
}
