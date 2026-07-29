"use client";

import { cn } from "@/lib/utils";

interface AssistantChatLoadingStateProps {
  className?: string;
}

export function AssistantChatLoadingState({ className }: AssistantChatLoadingStateProps) {
  return (
    <div className={cn("mx-auto flex w-full max-w-3xl flex-col gap-7", className)}>
      {Array.from({ length: 4 }).map((_, index) => {
        const isAssistantRow = index % 2 === 0;

        return (
          <div
            key={index}
            className={cn("flex w-full items-start", isAssistantRow ? "justify-start" : "justify-end")}
          >
            {isAssistantRow ? (
              <div className="mr-3 size-10 shrink-0 animate-pulse rounded-full border border-border/30 bg-muted/20" />
            ) : null}

            <div
              className={cn(
                "animate-pulse rounded-2xl bg-muted/20",
                isAssistantRow
                  ? "h-5 w-[min(24rem,70vw)]"
                  : "h-9 w-[min(7rem,18vw)]",
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
