"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import type { AssistantConversationViewModel } from "@/contexts/assistant/interfaces/view-models/assistant-chat.view-model";

import { AssistantChatComposer } from "./assistant-chat-composer";
import { AssistantChatEmptyState } from "./assistant-chat-empty-state";
import { AssistantChatThread } from "./assistant-chat-thread";
import { useAssistantStream } from "./hooks/use-assistant-stream";
import { useConversationTitlePolling } from "./hooks/use-conversation-title-polling";
import { useAssistantTranslations } from "@/contexts/assistant/interfaces/i18n";

type AssistantChatViewProps = {
  conversationId: string | null;
  initialConversation: AssistantConversationViewModel | null;
  hasAssistantAccess: boolean;
  establishmentId: string | null;
};

export function AssistantChatView({
  conversationId,
  initialConversation,
  hasAssistantAccess,
  establishmentId,
}: AssistantChatViewProps) {
  const { t } = useAssistantTranslations();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const {
    setActiveConversation,
    visibleConversation,
    isThreadVisible,
    draft,
    setDraft,
    isSendingMessage,
    error,
    sendMessage,
    handleComposerKeyDown,
  } = useAssistantStream({
    conversationId,
    initialConversation,
    hasAssistantAccess,
    establishmentId,
    router,
  });

  useConversationTitlePolling({
    conversationId,
    visibleConversation,
    setActiveConversation,
    router,
  });

  return (
    <div className="flex min-h-[calc(100svh-6rem)] flex-col">
      {isThreadVisible ? (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <AssistantChatThread
            conversation={visibleConversation}
            isLoading={false}
            isAssistantThinking={isSendingMessage}
            bottomRef={bottomRef}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="pointer-events-auto w-full max-w-4xl">
              <AssistantChatComposer
                value={draft}
                isSending={isSendingMessage || !hasAssistantAccess}
                onValueChange={setDraft}
                onSubmit={() => {
                  void sendMessage();
                }}
                onKeyDown={handleComposerKeyDown}
                disabled={!hasAssistantAccess}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[calc(100svh-6rem)] flex-1 flex-col justify-center">
          <AssistantChatEmptyState />
          <div className="h-8 sm:h-10" />
          <AssistantChatComposer
            value={draft}
            isSending={isSendingMessage || !hasAssistantAccess}
            onValueChange={setDraft}
            onSubmit={() => {
              void sendMessage();
            }}
            onKeyDown={handleComposerKeyDown}
            disabled={!hasAssistantAccess}
            variant="minimal"
          />
        </div>
      )}

      <ErrorAlert
        title={t.chat.assistantError}
        message={
          !hasAssistantAccess
            ? t.chat.noAccessError
            : error ?? undefined
        }
      />
    </div>
  );
}
