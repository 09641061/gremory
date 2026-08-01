"use client";

import { AssistantAvatar } from "@/contexts/shared/interfaces/components/kodu/kodu-avatar";
export function AssistantChatThinkingBubble() {
  return (
    <div className="flex w-full max-w-[min(48rem,calc(100vw-6rem))] items-start gap-3 sm:max-w-[42rem]" aria-live="polite" aria-label="AI is thinking.">
      <AssistantAvatar
        className="mt-1 size-10"
        iconSize={20}
        iconClassName="size-5"
        variant="flat"
      />

      <div className="py-1 text-sm leading-6 text-foreground">
        <span className="mt-1 inline-flex items-center gap-2 text-muted-foreground">
          <span>Kodu is thinking</span>
          <span className="flex items-center gap-1" aria-hidden="true">
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.2s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.1s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70" />
          </span>
        </span>
      </div>
    </div>
  );
}
