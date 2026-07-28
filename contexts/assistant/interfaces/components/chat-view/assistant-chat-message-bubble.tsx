"use client";

import { cn } from "@/lib/utils";

import { AssistantAvatar } from "../shared/assistant-avatar";
import type { AssistantChatMessage } from "../shared/assistant-chat.types";

interface AssistantChatMessageBubbleProps {
  message: AssistantChatMessage;
}

export function AssistantChatMessageBubble({ message }: AssistantChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? (
        <AssistantAvatar className="mr-3 mt-1 size-11" iconSize={22} iconClassName="size-[22px]" />
      ) : null}

      <div
        className={cn(
          "max-w-[min(44rem,calc(100vw-7rem))] whitespace-pre-wrap break-words text-[15px] leading-7 text-foreground sm:max-w-[38rem]",
          isUser
            ? "rounded-2xl bg-muted/80 px-4 py-3"
            : "px-0 py-1",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
