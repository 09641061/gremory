import "server-only";

import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { AssistantApiGateway } from "@/contexts/assistant/infrastructure/gateways/assistant-api.gateway";
import { AssistantConversationRepositoryImpl } from "@/contexts/assistant/infrastructure/repositories/assistant-conversation.repository";

export async function createAssistantConversationRepository(
  establishmentId?: string | null,
): Promise<AssistantConversationRepositoryImpl> {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({
    establishmentId: establishmentId ?? undefined,
  });

  if (!workspace.organization) {
    throw new Error("An active organization is required to use the assistant");
  }

  return new AssistantConversationRepositoryImpl(
    new AssistantApiGateway(workspace.organization.id),
  );
}
