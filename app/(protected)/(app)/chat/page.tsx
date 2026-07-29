import { GetConversationQueryService } from "@/contexts/assistant/application/internal/queryservices/get-conversation-query.service";
import { AssistantChatView } from "@/contexts/assistant/interfaces/components/chat-view/assistant-chat-view";

export default async function ChatPage({
  searchParams,
}: {
  searchParams?: Promise<{ conversationId?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const conversationId = resolvedSearchParams?.conversationId;

  const initialConversation = conversationId
    ? await new GetConversationQueryService().handle(conversationId)
    : null;

  return (
    <AssistantChatView
      key={conversationId ?? "new"}
      initialConversation={initialConversation}
    />
  );
}
