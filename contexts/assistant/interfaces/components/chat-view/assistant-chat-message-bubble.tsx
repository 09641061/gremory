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
  const assistantMarkdownClassName =
    "min-w-0 overflow-x-auto break-words pt-1 text-[15px] leading-7 text-foreground " +
    "[&_table]:min-w-max [&_table]:border-separate [&_table]:border-spacing-x-4 [&_table]:border-spacing-y-2 " +
    "[&_th]:whitespace-nowrap [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:align-top " +
    "[&_td]:px-4 [&_td]:py-2 [&_td]:align-top " +
    "[&_thead_th]:border-b [&_thead_th]:border-border/60 " +
    "[&_tbody_tr:not(:last-child)_td]:border-b [&_tbody_tr:not(:last-child)_td]:border-border/30";

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
            className="mt-1 size-10"
            iconSize={20}
            iconClassName="size-5"
            variant="flat"
          />

          <div
            className={assistantMarkdownClassName}
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
