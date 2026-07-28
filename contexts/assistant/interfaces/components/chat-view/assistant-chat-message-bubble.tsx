"use client";

import Image from "next/image";

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
          <Image
            src="/kodu_assistant_icon.svg"
            alt=""
            width={16}
            height={16}
            className="size-4 object-contain"
          />
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
    </div>
  );
}
