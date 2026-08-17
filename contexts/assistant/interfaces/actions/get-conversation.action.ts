"use server";

import "server-only";
import { cookies } from "next/headers";

import { GetConversationQueryService } from "@/contexts/assistant/application/internal/queryservices/get-conversation-query.service";
import { createAssistantConversationsAdapter } from "@/contexts/assistant/infrastructure/adapters/assistant-conversations.adapter";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { toConversationViewModel } from "@/contexts/assistant/interfaces/presenters/assistant-chat.presenter.server";
import type { AssistantConversationViewModel } from "@/contexts/assistant/interfaces/view-models/assistant-chat.view-model";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export async function getAssistantConversationAction(
  conversationId: string,
): Promise<AssistantConversationViewModel | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;

    if (!accessToken) {
      return null;
    }

    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({});
    const conversation = await new GetConversationQueryService(
      createAssistantConversationsAdapter(workspace.organization?.id),
    ).handle(conversationId, accessToken);
    return toConversationViewModel(conversation);
  } catch {
    return null;
  }
}
