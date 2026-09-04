"use client";

import { useAssistantTranslations } from "@/contexts/assistant/interfaces/i18n";

interface AssistantChatEmptyStateProps {
  title?: string;
  subtitle?: string;
}

export function AssistantChatEmptyState({
  title,
  subtitle,
}: AssistantChatEmptyStateProps) {
  const { t } = useAssistantTranslations();
  const displayTitle = title ?? t.chat.emptyStateTitle;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 text-center sm:gap-5 sm:py-8">
      <h1 className="text-balance text-[1.8rem] font-semibold tracking-tight text-foreground sm:text-[2.6rem]">
        {displayTitle}
      </h1>
      {subtitle ? <p className="max-w-xl text-sm text-muted-foreground sm:text-base">{subtitle}</p> : null}
    </div>
  );
}
