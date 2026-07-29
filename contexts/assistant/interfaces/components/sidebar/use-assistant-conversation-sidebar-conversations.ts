"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

import type { ConversationMutationEventDetail } from "./assistant-conversation-mutation.events";

export function useAssistantConversationSidebarConversations(
  initialConversations: AssistantConversationSummaryReadModel[],
  activeConversationId: string | null,
) {
  const router = useRouter();
  const [conversations, setConversations] = useState(() => initialConversations);

  useEffect(() => {
    function handleMutation(event: Event) {
      const customEvent = event as CustomEvent<ConversationMutationEventDetail>;
      const detail = customEvent.detail;
      if (!detail) return;

      switch (detail.type) {
        case "upsert": {
          setConversations((current) => {
            const next = current.filter((item) => item.id !== detail.conversation.id);
            return detail.moveToFront ? [detail.conversation, ...next] : [...next, detail.conversation];
          });
          return;
        }
        case "rename": {
          setConversations((current) =>
            current.map((item) =>
              item.id === detail.conversationId ? { ...item, title: detail.title } : item,
            ),
          );
          return;
        }
        case "delete": {
          setConversations((current) => current.filter((item) => item.id !== detail.conversationId));
          if (detail.conversationId === activeConversationId) {
            router.replace("/chat", { scroll: false });
          }
          return;
        }
      }
    }

    window.addEventListener("assistant-conversations-updated", handleMutation);
    return () => window.removeEventListener("assistant-conversations-updated", handleMutation);
  }, [activeConversationId, router]);

  return {
    conversations,
    setConversations,
  };
}
