import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { composeAssistantAdapters } from "@/contexts/assistant/interfaces/server/assistant-composition";
import { AppShellSidebarClient } from "./app-sidebar-shell-client";
import { getAppShellData, logAppShellError } from "../layout/app-shell-data";

export async function AppShellSidebarServer() {
  const data = await getAppShellData();
  if (!data) return null;
  const { shell, workspace, currentProfile } = data;
  const assistantConversations = await (shell.hasAssistantAccess
    ? new ListConversationsQueryService(
        composeAssistantAdapters(workspace.organization?.id).conversations,
      )
        .handle({ page: 0, size: 20 })
        .catch((error) => {
          logAppShellError("list assistant conversations", error);
          return { content: [] as AssistantConversationSummaryReadModel[] };
        })
    : Promise.resolve({ content: [] as AssistantConversationSummaryReadModel[] }));
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
