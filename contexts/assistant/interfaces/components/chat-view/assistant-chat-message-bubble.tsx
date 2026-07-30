"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

import type { AssistantMessageReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { AssistantAvatar } from "@/contexts/shared/interfaces/components/assistant-avatar/assistant-avatar";
import { AssistantChatMarkdown } from "./assistant-chat-markdown";

interface AssistantChatMessageBubbleProps {
  message: AssistantMessageReadModel;
}

function AssistantChatMessageBubbleComponent({ message }: AssistantChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? (
        <div className="flex max-w-[min(48rem,calc(100vw-6rem))] items-start gap-3 sm:max-w-[42rem]">
          <AssistantAvatar
            className="mt-1 size-10 border-border/40 bg-white shadow-none"
            iconSize={20}
            iconClassName="size-5"
          />

          <AssistantChatMarkdown
            className="pt-1 text-[15px] leading-7 text-foreground"
            html={message.renderedContentHtml}
          />
        </div>
      ) : (
        <div
          className={cn(
            "max-w-[min(22rem,calc(100vw-6rem))] whitespace-pre-wrap break-words text-[15px] leading-7 text-foreground sm:max-w-[26rem]",
            "rounded-2xl border border-[#e7edf4] bg-[#f8fafc] px-4 py-3 shadow-none",
          )}
        >
          {message.content}
        </div>
      )}
    </div>
  );
}

export const AssistantChatMessageBubble = memo(
  AssistantChatMessageBubbleComponent,
  (previousProps, nextProps) =>
    previousProps.message.id === nextProps.message.id &&
    previousProps.message.role === nextProps.message.role &&
    previousProps.message.content === nextProps.message.content,
);
