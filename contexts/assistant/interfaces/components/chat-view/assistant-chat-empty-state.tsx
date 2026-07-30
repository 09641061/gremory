"use client";

import { AssistantAvatar } from "@/contexts/shared/interfaces/components/icons/assistant/assistant-kodu";

interface AssistantChatEmptyStateProps {
  title?: string;
  subtitle?: string;
}

export function AssistantChatEmptyState({
  title = "What do you want to manage today?",
  subtitle,
}: AssistantChatEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <AssistantAvatar
          className="size-14 border-border/50 bg-background/90 shadow-[0_8px_22px_rgba(15,23,42,0.06)]"
          iconSize={24}
          iconClassName="size-6"
        />
        <div className="space-y-3">
          <h1 className="text-balance text-[1.85rem] font-medium tracking-tight text-foreground sm:text-[2.8rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
