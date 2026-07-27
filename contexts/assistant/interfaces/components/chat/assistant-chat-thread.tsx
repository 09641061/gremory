"use client";

import type { RefObject } from "react";

import { AssistantChatLoadingState } from "./assistant-chat-loading-state";
import { AssistantChatMessageBubble } from "./assistant-chat-message-bubble";
import { AssistantChatWelcome } from "./assistant-chat-welcome";
import type { AssistantConversation } from "./assistant-chat.types";

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
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-border/60 bg-background/95 shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border/60 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="mt-1 truncate text-lg font-semibold text-foreground">
            {conversation?.title ?? "Nuevo chat"}
          </h1>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(26,185,145,0.08),transparent_35%)] px-4 py-6 sm:px-6">
        {isLoading ? (
          <AssistantChatLoadingState />
        ) : conversation?.messages.length ? (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
            {conversation.messages.map((message) => (
              <AssistantChatMessageBubble key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
          </div>
        ) : (
          <AssistantChatWelcome bottomRef={bottomRef} />
        )}
      </div>
    </section>
  );
}
