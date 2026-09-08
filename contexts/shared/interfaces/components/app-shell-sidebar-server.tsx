import { ListConversationsQueryService } from "@/contexts/assistant/application/internal/queryservices/list-conversations-query.service";
import { createAssistantConversationsAdapter } from "@/contexts/assistant/infrastructure/adapters/assistant-conversations.adapter";
import { AppShellSidebarClient } from "./app-shell-sidebar-client";
import { getAppShellData, logAppShellError } from "./app-shell-data";

export async function AppShellSidebarServer() {
  const data = await getAppShellData();
  if (!data) return null;
  const { shell, workspace } = data;
  const conversations = shell.hasAssistantAccess
    ? await new ListConversationsQueryService(createAssistantConversationsAdapter(workspace.organization?.id))
        .handle({ page: 0, size: 20 })
        .catch((error) => {
          logAppShellError("list assistant conversations", error);
          return { content: [] };
        })
    : { content: [] };
  return (
    <AppShellSidebarClient
      initialAssistantConversations={conversations.content}
      workspace={workspace}
      visibleRoutes={shell.visibleSidebarRoutes}
      showAssistantSection={shell.hasAssistantAccess}
      showAssistantNavigation={shell.hasAssistantAccess}
      showWorkspaceSwitcher={true}
    />
  );
}
