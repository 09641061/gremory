"use client";

import type { ReactNode, RefObject } from "react";

import { AssistantChatLoadingState } from "./assistant-chat-loading-state";
import { AssistantChatMessageBubble } from "./assistant-chat-message-bubble";
import type { AssistantConversation } from "../shared/assistant-chat.types";

interface AssistantChatThreadProps {
  conversation: AssistantConversation | null;
  isLoading: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
  error?: string | null;
  composer?: ReactNode;
}

export function AssistantChatThread({
  conversation,
  isLoading,
  bottomRef,
  error: _error,
  composer,
}: AssistantChatThreadProps) {
  void _error;

  return (
    <section className="relative isolate flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-y-auto px-4 py-6 pb-40 sm:px-6 sm:pb-44">
        {isLoading ? (
          <AssistantChatLoadingState />
        ) : conversation?.messages.length ? (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            {conversation.messages.map((message) => (
              <AssistantChatMessageBubble key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <div ref={bottomRef} />
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
