"use client";

import { cn } from "@/lib/utils";

interface AssistantChatLoadingStateProps {
  className?: string;
}

export function AssistantChatLoadingState({ className }: AssistantChatLoadingStateProps) {
  return (
    <div className={cn("mx-auto flex w-full max-w-4xl flex-col gap-4", className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-20 animate-pulse rounded-3xl border border-border/40 bg-muted/30",
            index % 2 === 0 ? "mr-10" : "ml-10",
          )}
        />
      ))}
    </div>
  );
}
