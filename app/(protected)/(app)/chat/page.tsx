import { GetConversationQueryService } from "@/contexts/assistant/application/internal/queryservices/get-conversation-query.service";
import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import { createSubscriptionAccessQueryService } from "@/contexts/billing/application/internal/queryservices/subscription-access-query.service";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
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
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  const subscription = accessToken
    ? await createCurrentSubscriptionQueryService().getCurrentSubscriptionSnapshot(accessToken)
    : null;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({
    establishmentId: requestedEstablishmentId,
  });
  const hasAssistantAccess =
    workspace.accessPolicy?.canUseAssistant ??
    createSubscriptionAccessQueryService().resolve(subscription).hasAssistantAccess;

  if (!hasAssistantAccess) {
    redirect("/");
  }

  const establishmentId =
    requestedEstablishmentId &&
    workspace.establishments.some((item) => item.id === requestedEstablishmentId)
      ? requestedEstablishmentId
      : workspace.activeEstablishmentId ?? null;
  const initialConversation = hasAssistantAccess && conversationId
    ? await new GetConversationQueryService().handle(conversationId)
    : null;
  const initialConversationViewModel = toConversationViewModel(initialConversation);

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
