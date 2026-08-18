import { GetConversationQueryService } from "@/contexts/assistant/application/internal/queryservices/get-conversation-query.service";
import { createAssistantConversationsAdapter } from "@/contexts/assistant/infrastructure/adapters/assistant-conversations.adapter";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { AssistantChatView } from "@/contexts/assistant/interfaces/components/chat-view/assistant-chat-view";
import { toConversationViewModel } from "@/contexts/assistant/interfaces/presenters/assistant-chat.presenter.server";
import { Alert, AlertTitle, AlertDescription } from "@/contexts/shared/interfaces/components/ui/alert";

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: Promise<{ conversationId?: string; denied?: string; establishmentId?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const conversationId = resolvedSearchParams?.conversationId;
  const denied = resolvedSearchParams?.denied;
  const requestedEstablishmentId = resolvedSearchParams?.establishmentId;

  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({
    establishmentId: requestedEstablishmentId,
  });
  const hasAssistantAccess = workspace.accessPolicy?.canUseAssistant ?? false;

  const establishmentId =
    requestedEstablishmentId &&
    workspace.establishments.some((item) => item.id === requestedEstablishmentId)
      ? requestedEstablishmentId
      : workspace.activeEstablishmentId ?? null;
  const initialConversation = hasAssistantAccess && conversationId
    ? await new GetConversationQueryService(
        createAssistantConversationsAdapter(workspace.organization?.id),
      ).handle(conversationId)
    : null;
  const initialConversationViewModel = toConversationViewModel(initialConversation);

  if (!hasAssistantAccess) {
    return (
      <div className="flex flex-col flex-1 w-full gap-4">
        {denied && (
          <div className="px-6 pt-4">
            <Alert variant="destructive">
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                {denied === "crm" && "You do not have permission to access the CRM module."}
                {denied === "catalog" && "You do not have permission to access the Catalog module."}
                {denied === "workforce" && "You do not have permission to access the Workforce module."}
              </AlertDescription>
            </Alert>
          </div>
        )}
        <div className="px-6 py-10">
          <Alert>
            <AlertTitle>Workspace ready</AlertTitle>
            <AlertDescription>
              You can use the sidebar to move through the modules available to your role.
              The assistant is not enabled for this account yet, so this page acts as a home
              shell while you work with the rest of the workspace.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {denied ? (
        <div className="px-4 pt-4 md:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertTitle>Access denied</AlertTitle>
            <AlertDescription>
              {denied === "crm" && "You do not have permission to access the CRM module."}
              {denied === "catalog" && "You do not have permission to access the Catalog module."}
              {denied === "workforce" && "You do not have permission to access the Workforce module."}
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
      <AssistantChatView
        key={`${conversationId ?? "new"}:${establishmentId ?? "all"}`}
        conversationId={conversationId ?? null}
        initialConversation={initialConversationViewModel}
        hasAssistantAccess={hasAssistantAccess}
        establishmentId={establishmentId}
      />
    </div>
  );
}
