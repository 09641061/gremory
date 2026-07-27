"use client";

import { Bot, User } from "lucide-react";

import { cn } from "@/lib/utils";

import type { AssistantChatMessage } from "./assistant-chat.types";

interface AssistantChatMessageBubbleProps {
  message: AssistantChatMessage;
}

export function AssistantChatMessageBubble({ message }: AssistantChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-end gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser ? (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Bot className="size-4" />
        </div>
      ) : null}

      <div
        className={cn(
          "max-w-[min(44rem,calc(100vw-7rem))] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[36rem]",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border/70 bg-card text-card-foreground",
        )}
      >
        {message.content}
      </div>

      {isUser ? (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User className="size-4" />
        </div>
      ) : null}
    </div>
  );
}
