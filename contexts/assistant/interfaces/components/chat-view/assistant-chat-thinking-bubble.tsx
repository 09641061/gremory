"use client";

import { cn } from "@/lib/utils";

import { AssistantAvatar } from "../icons/assistant-avatar/assistant-avatar";

interface AssistantChatThinkingBubbleProps {
  className?: string;
}

export function AssistantChatThinkingBubble({ className }: AssistantChatThinkingBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-[min(48rem,calc(100vw-6rem))] items-start gap-3 sm:max-w-[42rem]",
        className,
      )}
      aria-live="polite"
      aria-label="AI is thinking."
    >
      <AssistantAvatar
        className="mt-1 size-10 border-border/40 bg-white shadow-none"
        iconSize={20}
        iconClassName="size-5"
      />

      <div className="py-1 text-sm leading-6 text-foreground">
        <p>We received your message.</p>
        <div className="mt-1 flex items-center gap-2 text-muted-foreground">
          <span>Kodu is thinking</span>
          <span className="flex items-center gap-1" aria-hidden="true">
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.2s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.1s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70" />
          </span>
        </div>
      </div>
    </div>
  );
}
