"use client";

import { Bot, User } from "lucide-react";

import { cn } from "@/lib/utils";

import type { AssistantChatMessage } from "../shared/assistant-chat.types";

interface AssistantChatMessageBubbleProps {
  message: AssistantChatMessage;
}

export function AssistantChatMessageBubble({ message }: AssistantChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? (
        <div className="mr-3 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground">
          <Bot className="size-3.5" />
        </div>
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

      {isUser ? (
        <div className="ml-3 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted text-muted-foreground">
          <User className="size-3.5" />
        </div>
      ) : null}
    </div>
  );
}
