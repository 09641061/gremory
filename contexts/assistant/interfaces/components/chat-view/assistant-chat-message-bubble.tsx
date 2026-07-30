"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

import type { AssistantMessageViewModel } from "@/contexts/assistant/interfaces/view-models/assistant-chat.view-model";
import { AssistantAvatar } from "@/contexts/shared/interfaces/components/assistant-avatar/assistant-avatar";

interface AssistantChatMessageBubbleProps {
  message: AssistantMessageViewModel;
}

function AssistantChatMessageBubbleComponent({ message }: AssistantChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        !isUser && "items-start gap-3 max-w-[min(48rem,calc(100vw-6rem))] sm:max-w-[42rem]",
      )}
    >
      {!isUser ? (
        <>
          <AssistantAvatar
            className="mt-1 size-10 border-border/40 bg-white shadow-none"
            iconSize={20}
            iconClassName="size-5"
          />

          <div
            className="min-w-0 overflow-x-auto break-words pt-1 text-[15px] leading-7 text-foreground"
            dangerouslySetInnerHTML={{ __html: message.renderedContentHtml }}
          />
        </>
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
