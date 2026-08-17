"use client";

import { memo, useLayoutEffect, useRef, type RefObject } from "react";

import { AssistantChatWelcome } from "./assistant-chat-welcome";
import { AssistantChatLoadingState } from "./assistant-chat-loading-state";
import { AssistantChatMessageBubble } from "./assistant-chat-message-bubble";
import { AssistantChatThinkingBubble } from "./assistant-chat-thinking-bubble";
import type { AssistantConversationViewModel } from "@/contexts/assistant/interfaces/view-models/assistant-chat.view-model";

interface AssistantChatThreadProps {
  conversation: AssistantConversationViewModel | null;
  isLoading: boolean;
  isAssistantThinking?: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
}

function AssistantChatThreadComponent({
  conversation,
  isLoading,
  isAssistantThinking = false,
  bottomRef,
}: AssistantChatThreadProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldFollowBottomRef = useRef(true);
  const lastConversationIdRef = useRef<string | null>(null);
  const messages = conversation?.messages ?? [];

  function handleScroll() {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const distanceFromBottom =
      scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;
    shouldFollowBottomRef.current = distanceFromBottom <= 160;
  }

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || messages.length === 0) return;

    const isNewConversation = conversation?.id !== lastConversationIdRef.current;
    lastConversationIdRef.current = conversation?.id ?? null;

    if (isNewConversation) {
      shouldFollowBottomRef.current = true;
    }

    if (!shouldFollowBottomRef.current) {
      return;
    }

    bottomRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
  }, [messages.length, conversation?.id, isAssistantThinking, bottomRef]);

  return (
    <section className="relative isolate flex min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="absolute inset-0 z-0 overflow-y-auto px-4 py-8 pb-48 sm:px-6 sm:py-10 sm:pb-56"
      >
        {isLoading ? (
          <AssistantChatLoadingState />
        ) : (
          <>
            {messages.length ? (
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 sm:gap-12">
                {messages.map((message) => (
                  <AssistantChatMessageBubble key={message.id} message={message} />
                ))}

                {isAssistantThinking ? <AssistantChatThinkingBubble /> : null}
              </div>
            ) : (
              <AssistantChatWelcome />
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>
    </section>
  );
}

export const AssistantChatThread = memo(
  AssistantChatThreadComponent,
  (previousProps, nextProps) =>
    previousProps.conversation === nextProps.conversation &&
    previousProps.isLoading === nextProps.isLoading &&
    previousProps.isAssistantThinking === nextProps.isAssistantThinking &&
    previousProps.bottomRef === nextProps.bottomRef,
);
