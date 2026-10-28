"use server";

import { createChatApiGateway } from "../server/chat-composition";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { createActionErrorId, type ActionState } from "./action-state";
import type {
  WhatsappConversationSummary,
  WhatsappConversationDetail,
  WhatsappConversationPageViewModel,
  WhatsappMessageItem,
} from "../../application/models/whatsapp-chat";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";

export async function getWhatsappConversationsAction(
  establishmentId: string,
  filter = "ALL",
  search?: string,
  page = 0,
  size = 20,
): Promise<ActionState<WhatsappConversationPageViewModel>> {
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
  const isOwner = workspace.accountType === "OWNER";
  if (!hasEstablishmentPermission(getWorkspaceEstablishment(workspace, establishmentId), "crm:read", isOwner)) {
    return {
      status: "error",
      data: null,
      error: "You are not authorized to view conversations.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }

  try {
    const gateway = createChatApiGateway(workspace.organization?.id);
    const result = await gateway.listConversations(establishmentId, filter, search, page, size);
    return {
      status: "success",
      data: result,
      error: null,
      errorId: null,
      fieldErrors: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof ApiError ? error.message : "Failed to load conversations.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }
}

export async function getWhatsappConversationDetailAction(
  id: string,
  establishmentId: string,
): Promise<ActionState<WhatsappConversationDetail>> {
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
  const isOwner = workspace.accountType === "OWNER";
  if (!hasEstablishmentPermission(getWorkspaceEstablishment(workspace, establishmentId), "crm:read", isOwner)) {
    return {
      status: "error",
      data: null,
      error: "You are not authorized to view conversation detail.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }

  try {
    const gateway = createChatApiGateway(workspace.organization?.id);
    const result = await gateway.getConversation(id, establishmentId);
    return {
      status: "success",
      data: result,
      error: null,
      errorId: null,
      fieldErrors: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof ApiError ? error.message : "Failed to load conversation messages.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }
}

export async function takeoverWhatsappConversationAction(
  id: string,
  establishmentId: string,
): Promise<ActionState<WhatsappConversationSummary>> {
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
  const isOwner = workspace.accountType === "OWNER";
  const establishment = getWorkspaceEstablishment(workspace, establishmentId);
  const authorized =
    hasEstablishmentPermission(establishment, "crm:manage", isOwner) ||
    hasEstablishmentPermission(establishment, "crm:update", isOwner);
  if (!authorized) {
    return {
      status: "error",
      data: null,
      error: "You are not authorized to take over conversation.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }

  try {
    const gateway = createChatApiGateway(workspace.organization?.id);
    const result = await gateway.takeoverConversation(id, establishmentId);
    return {
      status: "success",
      data: result,
      error: null,
      errorId: null,
      fieldErrors: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof ApiError ? error.message : "Failed to take over conversation.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }
}

export async function releaseWhatsappConversationAction(
  id: string,
  establishmentId: string,
): Promise<ActionState<WhatsappConversationSummary>> {
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
  const isOwner = workspace.accountType === "OWNER";
  const establishment = getWorkspaceEstablishment(workspace, establishmentId);
  const authorized =
    hasEstablishmentPermission(establishment, "crm:manage", isOwner) ||
    hasEstablishmentPermission(establishment, "crm:update", isOwner);
  if (!authorized) {
    return {
      status: "error",
      data: null,
      error: "You are not authorized to release conversation.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }

  try {
    const gateway = createChatApiGateway(workspace.organization?.id);
    const result = await gateway.releaseConversation(id, establishmentId);
    return {
      status: "success",
      data: result,
      error: null,
      errorId: null,
      fieldErrors: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof ApiError ? error.message : "Failed to release conversation.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }
}

export async function sendWhatsappMessageAction(
  id: string,
  establishmentId: string,
  text: string,
): Promise<ActionState<WhatsappMessageItem>> {
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
  const isOwner = workspace.accountType === "OWNER";
  const establishment = getWorkspaceEstablishment(workspace, establishmentId);
  const authorized =
    hasEstablishmentPermission(establishment, "crm:manage", isOwner) ||
    hasEstablishmentPermission(establishment, "crm:update", isOwner);
  if (!authorized) {
    return {
      status: "error",
      data: null,
      error: "You are not authorized to send messages.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }

  try {
    const gateway = createChatApiGateway(workspace.organization?.id);
    const result = await gateway.sendMessage(id, establishmentId, text);
    return {
      status: "success",
      data: result,
      error: null,
      errorId: null,
      fieldErrors: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof ApiError ? error.message : "Failed to send message.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }
}

export async function openWhatsappForCustomerAction(
  customerId: string,
  establishmentId: string,
): Promise<ActionState<WhatsappConversationSummary | null>> {
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
  const isOwner = workspace.accountType === "OWNER";
  if (!hasEstablishmentPermission(getWorkspaceEstablishment(workspace, establishmentId), "crm:read", isOwner)) {
    return {
      status: "error",
      data: null,
      error: "You are not authorized to open conversation for customer.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }

  try {
    const gateway = createChatApiGateway(workspace.organization?.id);
    const result = await gateway.openForCustomer(customerId, establishmentId);
    return {
      status: "success",
      data: result,
      error: null,
      errorId: null,
      fieldErrors: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof ApiError ? error.message : "Failed to open conversation.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }
}

export async function getWsAuthTicketAction(): Promise<{ token: string | null; wsUrl: string }> {
  const { cookies } = await import("next/headers");
  const { iamSessionCookies } = await import("@/contexts/iam/infrastructure/session/iam-session-cookie");
  const cookieStore = await cookies();
  const token = cookieStore.get(iamSessionCookies.accessToken)?.value ?? null;
  const baseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || process.env.API_BASE_URL || "http://localhost:8080";
  const wsUrl = baseUrl.replace(/^http/, "ws");
  return { token, wsUrl };
}
