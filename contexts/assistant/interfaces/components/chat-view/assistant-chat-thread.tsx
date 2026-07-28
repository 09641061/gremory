"use client";

import type { RefObject } from "react";

import { AssistantChatLoadingState } from "./assistant-chat-loading-state";
import { AssistantChatMessageBubble } from "./assistant-chat-message-bubble";
import type { AssistantConversation } from "../shared/assistant-chat.types";

interface AssistantChatThreadProps {
  conversation: AssistantConversation | null;
  isLoading: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
  error?: string | null;
}

export function AssistantChatThread({
  conversation,
  isLoading,
  bottomRef,
  error: _error,
}: AssistantChatThreadProps) {
  void _error;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
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
    </section>
  );
}
