import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { createAssistantConversationsAdapter } from "@/contexts/assistant/infrastructure/adapters/assistant-conversations.adapter";
import { getMyProfileServerQuery } from "@/contexts/profiles/interfaces/queries/get-my-profile.query-handler";
import { AppShellSidebarClient } from "./app-sidebar-shell-client";
import { getAppShellData, logAppShellError } from "../app-shell-data";

export async function AppShellSidebarServer() {
  const data = await getAppShellData();
  if (!data) return null;
  const { shell, workspace } = data;
  const [currentProfile, assistantConversations] = await Promise.all([
    getMyProfileServerQuery(),
    shell.hasAssistantAccess
      ? new ListConversationsQueryService(createAssistantConversationsAdapter(workspace.organization?.id))
          .handle({ page: 0, size: 20 })
          .catch((error) => {
            logAppShellError("list assistant conversations", error);
            return { content: [] as AssistantConversationSummaryReadModel[] };
          })
      : Promise.resolve({ content: [] as AssistantConversationSummaryReadModel[] }),
  ]);
  return (
    <AppShellSidebarClient
      initialAssistantConversations={assistantConversations.content}
      currentProfile={currentProfile}
      workspace={workspace}
      visibleRoutes={shell.visibleSidebarRoutes}
      showAssistantSection={shell.hasAssistantAccess}
      showAssistantNavigation={shell.hasAssistantAccess}
      showWorkspaceSwitcher={true}
    />
  );
}
