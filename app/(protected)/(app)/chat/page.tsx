import { GetConversationQueryService } from "@/contexts/assistant/application/internal/queryservices/get-conversation-query.service";
import { BillingApiGateway } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";
import { hasActiveSubscription } from "@/contexts/billing/domain/services/subscription-access.policy";
import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { AssistantChatView } from "@/contexts/assistant/interfaces/components/chat-view/assistant-chat-view";
import { toConversationViewModel } from "@/contexts/assistant/interfaces/presenters/assistant-chat.presenter.server";

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: Promise<{ conversationId?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const conversationId = resolvedSearchParams?.conversationId;
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;

  const subscription = accessToken
    ? await new BillingApiGateway().getCurrentSubscription(accessToken).catch(() => null)
    : null;
  const hasAssistantAccess = hasActiveSubscription(subscription);

  const initialConversation = hasAssistantAccess && conversationId
    ? await new GetConversationQueryService().handle(conversationId)
    : null;
  const initialConversationViewModel = toConversationViewModel(initialConversation);

  return (
    <AssistantChatView
      key={conversationId ?? "new"}
      conversationId={conversationId ?? null}
      initialConversation={initialConversationViewModel}
      hasAssistantAccess={hasAssistantAccess}
    />
  );
}
