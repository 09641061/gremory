import { Suspense } from "react";
import { composeAssistantAdapters } from "@/contexts/assistant/interfaces/server/assistant-composition";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { AssistantChatView } from "@/contexts/assistant/interfaces/components/chat-view/assistant-chat-view";
import { AssistantChatLoadingState } from "@/contexts/assistant/interfaces/components/chat-view/assistant-chat-loading-state";
import { toConversationViewModel } from "@/contexts/assistant/interfaces/presenters/assistant-chat.presenter.server";
import { Alert, AlertTitle, AlertDescription } from "@/contexts/shared/interfaces/components/ui/alert";
import { getAssistantDictionary } from "@/contexts/assistant/interfaces/i18n";
import { getServerLocale } from "@/contexts/shared/infrastructure/i18n/server";

type ChatPageSearchParams = {
  conversationId?: string;
  denied?: string;
  establishmentId?: string;
};

/**
 * Touches no dynamic API itself: `searchParams` and every data fetch live in
 * `ChatPageContent`, behind its own `<Suspense>` boundary below. Awaiting
 * `searchParams` up here instead would make the whole route dynamic before
 * it ever reaches a boundary, so Next couldn't prerender a static shell for
 * it (see nextjs.org/docs/messages/blocking-prerender-dynamic).
 */
export default function ChatPage({
  searchParams,
}: {
  searchParams?: Promise<ChatPageSearchParams>;
}) {
  return (
    <Suspense fallback={<AssistantChatLoadingState />}>
      <ChatPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ChatPageContent({
  searchParams,
}: {
  searchParams?: Promise<ChatPageSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const conversationId = resolvedSearchParams?.conversationId;
  const denied = resolvedSearchParams?.denied;
  const requestedEstablishmentId = resolvedSearchParams?.establishmentId;

  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({
    establishmentId: requestedEstablishmentId,
  });
  const hasAssistantAccess = workspace.accessPolicy?.canUseAssistant ?? false;

  const establishmentId =
    requestedEstablishmentId &&
    workspace.establishments.some((item) => item.id === requestedEstablishmentId)
      ? requestedEstablishmentId
      : workspace.activeEstablishmentId ?? null;
  const initialConversation = hasAssistantAccess && conversationId
    ? await composeAssistantAdapters(workspace.organization?.id).getConversation.handle(conversationId)
    : null;
  const serverLocale = await getServerLocale();
  const dictionary = getAssistantDictionary(serverLocale);
  const initialConversationViewModel = toConversationViewModel(initialConversation);

  const deniedMessage =
    denied === "crm"
      ? dictionary.alerts.deniedCrm
      : denied === "catalog"
        ? dictionary.alerts.deniedCatalog
        : denied === "workforce"
          ? dictionary.alerts.deniedWorkforce
          : null;

  if (!hasAssistantAccess) {
    return (
      <div className="flex flex-col flex-1 w-full gap-4">
        {denied && deniedMessage && (
          <div className="px-6 pt-4">
            <Alert variant="destructive">
              <AlertTitle>{dictionary.alerts.accessDeniedTitle}</AlertTitle>
              <AlertDescription>{deniedMessage}</AlertDescription>
            </Alert>
          </div>
        )}
        <div className="px-6 py-10">
          <Alert>
            <AlertTitle>{dictionary.alerts.workspaceReadyTitle}</AlertTitle>
            <AlertDescription>
              {dictionary.alerts.workspaceReadyDesc}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {denied && deniedMessage ? (
        <div className="px-4 pt-4 md:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertTitle>{dictionary.alerts.accessDeniedTitle}</AlertTitle>
            <AlertDescription>{deniedMessage}</AlertDescription>
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
