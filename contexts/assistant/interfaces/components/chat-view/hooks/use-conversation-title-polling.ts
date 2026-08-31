import { useEffect } from "react";
import type { useRouter } from "next/navigation";

import { getAssistantConversationAction } from "@/contexts/assistant/interfaces/actions/get-conversation.action";
import type { AssistantConversationViewModel } from "@/contexts/assistant/interfaces/view-models/assistant-chat.view-model";

const TITLE_POLL_DELAY_MS = 500;
const TITLE_POLL_MAX_ATTEMPTS = 3;

function isPendingTitle(title: string | null | undefined): title is null | undefined {
  return title == null;
}

type Router = ReturnType<typeof useRouter>;

interface UseConversationTitlePollingParams {
  conversationId: string | null;
  visibleConversation: AssistantConversationViewModel | null;
  setActiveConversation: (conversation: AssistantConversationViewModel) => void;
  router: Router;
}

/**
 * Polls the backend for a conversation's generated title while it is still
 * pending (null/undefined), broadcasting a rename event once it resolves.
 */
export function useConversationTitlePolling({
  conversationId,
  visibleConversation,
  setActiveConversation,
  router,
}: UseConversationTitlePollingParams) {
  useEffect(() => {
    if (!conversationId || !visibleConversation || !isPendingTitle(visibleConversation.title)) {
      return;
    }

    const targetConversationId = conversationId;
    let cancelled = false;
    let timeoutId: number | null = null;

    async function pollConversationTitle(attempt: number) {
      try {
        const nextConversation = await getAssistantConversationAction(targetConversationId);

        if (cancelled) {
          return;
        }

        if (!nextConversation) {
          throw new Error("Failed to fetch assistant conversation");
        }

        if (!isPendingTitle(nextConversation.title)) {
          setActiveConversation(nextConversation);
          window.dispatchEvent(
            new CustomEvent("assistant-conversations-updated", {
              detail: {
                type: "rename",
                conversationId: targetConversationId,
                title: nextConversation.title,
              },
            }),
          );
          router.refresh();
          return;
        }
      } catch {
        if (cancelled) {
          return;
        }
      }

      if (cancelled || attempt >= TITLE_POLL_MAX_ATTEMPTS) {
        return;
      }

      timeoutId = window.setTimeout(() => {
        void pollConversationTitle(attempt + 1);
      }, TITLE_POLL_DELAY_MS);
    }

    timeoutId = window.setTimeout(() => {
      void pollConversationTitle(1);
    }, TITLE_POLL_DELAY_MS);

    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [conversationId, visibleConversation, visibleConversation?.title, visibleConversation?.id, router, setActiveConversation]);
}
