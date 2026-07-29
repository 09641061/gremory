"use client";

import type { ReactNode, RefObject } from "react";

import { AssistantChatWelcome } from "./assistant-chat-welcome";
import { AssistantChatLoadingState } from "./assistant-chat-loading-state";
import { AssistantChatMessageBubble } from "./assistant-chat-message-bubble";
import { AssistantChatThinkingBubble } from "./assistant-chat-thinking-bubble";
import type { AssistantConversationReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";

interface AssistantChatThreadProps {
  conversation: AssistantConversationReadModel | null;
  isLoading: boolean;
  isAssistantThinking?: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
  error?: string | null;
  composer?: ReactNode;
  showWelcome?: boolean;
}

export function AssistantChatThread({
  conversation,
  isLoading,
  isAssistantThinking = false,
  bottomRef,
  error: _error,
  composer,
  showWelcome = true,
}: AssistantChatThreadProps) {
  void _error;
  const messages = conversation?.messages ?? [];
  const shouldShowWelcome = showWelcome && messages.length > 0 && messages[0]?.role !== "assistant";

  return (
    <section className="relative isolate flex min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 overflow-y-auto px-4 py-10 pb-48 sm:px-6 sm:py-12 sm:pb-56">
        {isLoading ? (
          <AssistantChatLoadingState />
        ) : messages.length ? (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 sm:gap-12">
            {shouldShowWelcome ? (
              <>
                <AssistantChatWelcome />
                <div className="h-2 sm:h-4" />
              </>
            ) : null}

            {messages.map((message) => (
              <AssistantChatMessageBubble key={message.id} message={message} />
            ))}
            {isAssistantThinking ? <AssistantChatThinkingBubble /> : null}
            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <AssistantChatWelcome bottomRef={bottomRef} />
          </div>
        )}
      </div>

      {composer ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="pointer-events-auto w-full max-w-4xl">{composer}</div>
        </div>
      ) : null}
    </section>
  );
}
